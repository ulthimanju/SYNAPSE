import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.role import Role

class RoleRepository:
    """Repository for managing Role entities in PostgreSQL."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_role_by_name(self, name: str) -> Optional[Role]:
        stmt = select(Role).where(Role.name == name)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_role_by_id(self, role_id: uuid.UUID) -> Optional[Role]:
        return await self.session.get(Role, role_id)

    async def list_roles(self) -> List[Role]:
        stmt = select(Role)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_role(self, name: str, description: Optional[str] = None) -> Role:
        role = Role(name=name, description=description)
        self.session.add(role)
        await self.session.flush()
        return role
