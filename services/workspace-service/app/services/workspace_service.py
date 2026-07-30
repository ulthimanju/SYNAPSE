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

    async def list_user_workspaces(self, user_id: str) -> List[WorkspaceRead]:
        """Lists all workspaces accessible by the user via membership."""
        memberships = await self.membership_repo.list_by_user(user_id)
        ws_ids = [m.workspace_id for m in memberships]
        workspaces = await self.workspace_repo.list_by_ids(ws_ids)

        return [
          WorkspaceRead(
              id=str(ws.id),
              name=ws.name,
              owner_id=ws.owner_id,
              visibility=ws.visibility,
              is_archived=ws.is_archived,
              created_at=ws.created_at,
              updated_at=ws.updated_at,
          ) for ws in workspaces
        ]

    async def get_workspace_detail(self, user_id: str, workspace_id: str) -> WorkspaceRead:
        """Fetches workspace details after verifying user membership."""
        membership = await self.membership_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise ForbiddenException("You are not a member of this workspace")

        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

        return WorkspaceRead(
            id=str(workspace.id),
            name=workspace.name,
            owner_id=workspace.owner_id,
            visibility=workspace.visibility,
            is_archived=workspace.is_archived,
            created_at=workspace.created_at,
            updated_at=workspace.updated_at,
        )

    async def update_workspace(self, user_id: str, workspace_id: str, payload: WorkspaceUpdate) -> WorkspaceRead:
        """Updates workspace fields after verifying user membership."""
        membership = await self.membership_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise ForbiddenException("You are not authorized to modify this workspace")

        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise NotFoundException("Workspace not found")

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
