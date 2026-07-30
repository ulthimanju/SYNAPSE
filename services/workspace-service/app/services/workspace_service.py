from typing import List
from shared.exceptions import NotFoundException, ForbiddenException, BadRequestException
from ..repositories.workspace_repository import WorkspaceRepository
from ..repositories.membership_repository import MembershipRepository
from ..schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceRead

class WorkspaceService:
    """Business logic for Workspace operations."""

    def __init__(
        self,
        workspace_repo: WorkspaceRepository | None = None,
        membership_repo: MembershipRepository | None = None,
    ):
        self.workspace_repo = workspace_repo or WorkspaceRepository()
        self.membership_repo = membership_repo or MembershipRepository()

    async def create_workspace(self, user_id: str, payload: WorkspaceCreate) -> WorkspaceRead:
        """Creates a workspace and assigns the creator as owner in memberships."""
        workspace = await self.workspace_repo.create(
            name=payload.name,
            owner_id=user_id,
            visibility=payload.visibility,
        )

        # Automatically create owner membership record
        await self.membership_repo.create(
            workspace_id=str(workspace.id),
            user_id=user_id,
            role="owner"
        )

        return WorkspaceRead(
            id=str(workspace.id),
            name=workspace.name,
            owner_id=workspace.owner_id,
            visibility=workspace.visibility,
            is_archived=workspace.is_archived,
            created_at=workspace.created_at,
            updated_at=workspace.updated_at,
        )

    async def list_user_workspaces(self, user_id: str, email: str | None = None) -> List[WorkspaceRead]:
        """Lists all workspaces accessible by the user via membership or ownership."""
        memberships = await self.membership_repo.list_by_user(user_id, email)
        ws_ids = [m.workspace_id for m in memberships]
        workspaces = await self.workspace_repo.list_by_ids(ws_ids)

        mem_map = {m.workspace_id: m for m in memberships}

        results = []
        for ws in workspaces:
            mem = mem_map.get(str(ws.id))
            is_owner = (ws.owner_id == user_id) or (mem and mem.role == "owner")
            role = "owner" if is_owner else (mem.role if mem else "collaborator")
            results.append(
                WorkspaceRead(
                    id=str(ws.id),
                    name=ws.name,
                    owner_id=ws.owner_id,
                    visibility=ws.visibility,
                    is_archived=ws.is_archived,
                    role=role,
                    is_owner=is_owner,
                    can_edit=is_owner,
                    created_at=ws.created_at,
                    updated_at=ws.updated_at,
                )
            )
        return results

    async def get_workspace_detail(self, user_id: str, workspace_id: str, email: str | None = None) -> WorkspaceRead:
        """Fetches workspace details after verifying user membership."""
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        membership = await self.membership_repo.get_membership(workspace_id, user_id)
        if not membership and email:
            membership = await self.membership_repo.get_membership(workspace_id, email)

        is_owner = workspace.owner_id == user_id or (membership and membership.role == "owner")
        if not is_owner and not membership:
            raise ForbiddenException("You are not a member of this workspace")

        role = "owner" if is_owner else (membership.role if membership else "collaborator")

        return WorkspaceRead(
            id=str(workspace.id),
            name=workspace.name,
            owner_id=workspace.owner_id,
            visibility=workspace.visibility,
            is_archived=workspace.is_archived,
            role=role,
            is_owner=is_owner,
            can_edit=is_owner,
            created_at=workspace.created_at,
            updated_at=workspace.updated_at,
        )

    async def update_workspace(self, user_id: str, workspace_id: str, payload: WorkspaceUpdate) -> WorkspaceRead:
        """Updates workspace fields after verifying owner permission."""
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        if workspace.owner_id != user_id:
            raise ForbiddenException("Only the workspace owner can modify workspace settings")

        updated_ws = await self.workspace_repo.update(
            workspace,
            name=payload.name,
            visibility=payload.visibility,
            is_archived=payload.is_archived,
        )

        return WorkspaceRead(
            id=str(updated_ws.id),
            name=updated_ws.name,
            owner_id=updated_ws.owner_id,
            visibility=updated_ws.visibility,
            is_archived=updated_ws.is_archived,
            role="owner",
            is_owner=True,
            can_edit=True,
            created_at=updated_ws.created_at,
            updated_at=updated_ws.updated_at,
        )

    async def delete_workspace(self, user_id: str, workspace_id: str) -> bool:
        """Deletes a workspace and cascades deletion across all related MongoDB collections."""
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        if workspace.owner_id != user_id:
            raise ForbiddenException("Only the workspace owner can delete this workspace")

        # Cascade delete across all related MongoDB collections
        await self.cascade_delete_workspace_data(workspace_id)
        await self.workspace_repo.delete(workspace)
        return True

    async def _check_user_exists_by_email(self, email: str) -> str | None:
        """Checks if a user with the specified email exists in PostgreSQL identity database or MongoDB."""
        cleaned = email.strip().lower()
        
        # 1. Query PostgreSQL identity database users table
        try:
            import asyncpg
            from shared.config import settings
            pg = settings.postgres
            conn = await asyncpg.connect(
                host=pg.host,
                port=pg.port,
                user=pg.user,
                password=pg.password,
                database=pg.db_name
            )
            try:
                row = await conn.fetchrow("SELECT id FROM users WHERE LOWER(email) = $1", cleaned)
                if row:
                    return str(row["id"])
            finally:
                await conn.close()
        except Exception as exc:
            print(f"PG user email lookup notice: {exc}")

        # 2. Check MongoDB users or memberships
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            from shared.config import settings
            client = AsyncIOMotorClient(settings.mongodb.uri)
            db = client[settings.mongodb.db_name]
            user_doc = await db["users"].find_one({"email": cleaned})
            if user_doc:
                return str(user_doc["_id"])
            
            mem = await db["memberships"].find_one({"email": cleaned})
            if mem:
                return str(mem["user_id"])
        except Exception:
            pass

        return None

    async def invite_collaborator(self, owner_id: str, workspace_id: str, email: str, role: str = "collaborator"):
        """Invites a collaborator to the workspace. Restricted to workspace owner."""
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        if workspace.owner_id != owner_id:
            raise ForbiddenException("Only the workspace owner can invite collaborators")

        cleaned_email = email.strip().lower()
        target_user_id = await self._check_user_exists_by_email(cleaned_email)
        if not target_user_id:
            raise NotFoundException("User not found in database. Only registered users can be invited.")

        membership = await self.membership_repo.create(
            workspace_id=workspace_id,
            user_id=target_user_id,
            email=cleaned_email,
            role=role
        )
        return {
            "id": str(membership.id),
            "workspace_id": workspace_id,
            "user_id": membership.user_id,
            "email": membership.email,
            "role": membership.role,
            "joined_at": membership.joined_at,
        }

    async def list_collaborators(self, user_id: str, workspace_id: str):
        """Lists all collaborators and members of a workspace."""
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        membership = await self.membership_repo.get_membership(workspace_id, user_id)
        if workspace.owner_id != user_id and not membership:
            raise ForbiddenException("You are not a member of this workspace")

        members = await self.membership_repo.list_by_workspace(workspace_id)
        return [
            {
                "id": str(m.id),
                "workspace_id": m.workspace_id,
                "user_id": m.user_id,
                "email": m.email or m.user_id,
                "role": m.role,
                "joined_at": m.joined_at,
            }
            for m in members
        ]

    async def remove_collaborator(self, owner_id: str, workspace_id: str, target_id_or_email: str) -> bool:
        """Removes a collaborator from the workspace. Restricted to workspace owner."""
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        if workspace.owner_id != owner_id:
            raise ForbiddenException("Only the workspace owner can remove collaborators")

        if target_id_or_email == workspace.owner_id:
            raise BadRequestException("Cannot remove the workspace owner from collaborators")

        return await self.membership_repo.delete_member(workspace_id, target_id_or_email)

    async def cascade_delete_workspace_data(self, workspace_id: str) -> None:
        """Helper performing cascade deletion across all related MongoDB collections for a workspace."""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            from shared.config import settings
            client = AsyncIOMotorClient(settings.mongodb.uri)
            db = client[settings.mongodb.db_name]

            # 1. Delete documents & parsed_documents
            docs = await db["documents"].find({"workspace_id": workspace_id}).to_list(1000)
            doc_ids = [str(d["_id"]) for d in docs]
            if doc_ids:
                await db["parsed_documents"].delete_many({"document_id": {"$in": doc_ids}})
            await db["documents"].delete_many({"workspace_id": workspace_id})

            # 2. Delete document_chunks, workspace_summaries, learning_paths, flashcards, quizzes, generation_jobs, memberships
            await db["document_chunks"].delete_many({"workspace_id": workspace_id})
            await db["workspace_summaries"].delete_many({"workspace_id": workspace_id})
            await db["learning_paths"].delete_many({"workspace_id": workspace_id})
            await db["flashcards"].delete_many({"workspace_id": workspace_id})
            await db["quizzes"].delete_many({"workspace_id": workspace_id})
            await db["generation_jobs"].delete_many({"workspace_id": workspace_id})
            await db["memberships"].delete_many({"workspace_id": workspace_id})
        except Exception as exc:
            print(f"Cascade workspace cleanup notice for {workspace_id}: {exc}")
