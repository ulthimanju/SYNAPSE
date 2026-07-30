from typing import List, Optional
from beanie.operators import In, Or
from ..models.membership import Membership

class MembershipRepository:
    """Repository for managing Membership documents in MongoDB."""

    async def create(self, workspace_id: str, user_id: str, role: str = "owner", email: Optional[str] = None) -> Membership:
        existing = await self.get_membership(workspace_id, user_id)
        if existing:
            existing.role = role
            if email:
                existing.email = email
            await existing.save()
            return existing

        membership = Membership(
            workspace_id=workspace_id,
            user_id=user_id,
            email=email,
            role=role
        )
        await membership.insert()
        return membership

    async def get_membership(self, workspace_id: str, user_id: str) -> Optional[Membership]:
        # Support search by user_id OR email (for invited users logging in with email)
        return await Membership.find_one(
            Membership.workspace_id == workspace_id,
            Or(Membership.user_id == user_id, Membership.email == user_id)
        )

    async def list_by_user(self, user_id: str, email: Optional[str] = None) -> List[Membership]:
        if email:
            return await Membership.find(
                Or(Membership.user_id == user_id, Membership.email == email)
            ).to_list()
        return await Membership.find(
            Or(Membership.user_id == user_id, Membership.email == user_id)
        ).to_list()

    async def list_by_workspace(self, workspace_id: str) -> List[Membership]:
        return await Membership.find(Membership.workspace_id == workspace_id).to_list()

    async def delete_member(self, workspace_id: str, user_id_or_email: str) -> bool:
        membership = await Membership.find_one(
            Membership.workspace_id == workspace_id,
            Or(Membership.user_id == user_id_or_email, Membership.email == user_id_or_email)
        )
        if membership:
            await membership.delete()
            return True
        return False

    async def delete_by_workspace(self, workspace_id: str) -> int:
        result = await Membership.find(Membership.workspace_id == workspace_id).delete()
        return result.deleted_count if result else 0
