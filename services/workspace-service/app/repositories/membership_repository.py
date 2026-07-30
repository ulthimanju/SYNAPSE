from typing import List, Optional
from beanie.operators import In
from ..models.membership import Membership

class MembershipRepository:
    """Repository for managing Membership documents in MongoDB."""

    async def create(self, workspace_id: str, user_id: str, role: str = "owner") -> Membership:
        membership = Membership(
            workspace_id=workspace_id,
            user_id=user_id,
            role=role
        )
        await membership.insert()
        return membership

    async def get_membership(self, workspace_id: str, user_id: str) -> Optional[Membership]:
        return await Membership.find_one(
            Membership.workspace_id == workspace_id,
            Membership.user_id == user_id
        )

    async def list_by_user(self, user_id: str) -> List[Membership]:
        return await Membership.find(Membership.user_id == user_id).to_list()

    async def delete_by_workspace(self, workspace_id: str) -> int:
        result = await Membership.find(Membership.workspace_id == workspace_id).delete()
        return result.deleted_count if result else 0
