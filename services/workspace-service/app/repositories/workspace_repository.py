from typing import List, Optional
from beanie import PydanticObjectId
from beanie.operators import In
from ..models.workspace import Workspace

class WorkspaceRepository:
    """Repository for managing Workspace documents in MongoDB."""

    async def create(self, name: str, owner_id: str, is_shared: bool = False) -> Workspace:
        workspace = Workspace(
            name=name,
            owner_id=owner_id,
            is_shared=is_shared
        )
        await workspace.insert()
        return workspace

    async def get_by_id(self, workspace_id: str) -> Optional[Workspace]:
        try:
            return await Workspace.get(PydanticObjectId(workspace_id))
        except Exception:
            return None

    async def list_by_ids(self, workspace_ids: List[str], include_archived: bool = False) -> List[Workspace]:
        if not workspace_ids:
            return []
        obj_ids = []
        for wid in workspace_ids:
            try:
                obj_ids.append(PydanticObjectId(wid))
            except Exception:
                continue

        if not obj_ids:
            return []

        query = [In(Workspace.id, obj_ids)]
        if not include_archived:
            query.append(Workspace.is_archived == False)

        return await Workspace.find(*query).to_list()

    async def list_by_owner(self, owner_id: str, include_archived: bool = False) -> List[Workspace]:
        query = [Workspace.owner_id == owner_id]
        if not include_archived:
            query.append(Workspace.is_archived == False)
        return await Workspace.find(*query).to_list()

    async def update(self, workspace: Workspace, **kwargs) -> Workspace:
        for key, value in kwargs.items():
            if value is not None and hasattr(workspace, key):
                setattr(workspace, key, value)
        await workspace.save()
        return workspace

    async def delete(self, workspace: Workspace) -> bool:
        await workspace.delete()
        return True
