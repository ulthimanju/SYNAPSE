import uuid
import logging
from typing import List, Optional, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.role import Role

logger = logging.getLogger(__name__)

# Global in-memory cache for static role definitions
_ROLE_MEMORY_CACHE: Dict[str, Role] = {}

class RoleRepository:
    """Repository for managing Role entities in PostgreSQL with in-memory caching optimization."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_role_by_name(self, name: str) -> Optional[Role]:
        """Returns role by name with in-memory caching to eliminate redundant database SELECT queries."""
        if name in _ROLE_MEMORY_CACHE:
            cached_role = _ROLE_MEMORY_CACHE[name]
            logger.info(f"⚡ [ROLE CACHE HIT] Returned role '{name}' from memory. Bypassed SQL query!")
            return await self.session.merge(cached_role)

        stmt = select(Role).where(Role.name == name)
        result = await self.session.execute(stmt)
        role = result.scalars().first()
        if role:
            _ROLE_MEMORY_CACHE[name] = role
        return role

    async def get_role_by_id(self, role_id: uuid.UUID) -> Optional[Role]:
        return await self.session.get(Role, role_id)

    async def list_roles(self) -> List[Role]:
        stmt = select(Role)
        result = await self.session.execute(stmt)
        roles = list(result.scalars().all())
        for r in roles:
            _ROLE_MEMORY_CACHE[r.name] = r
        return roles

    async def create_role(self, name: str, description: Optional[str] = None) -> Role:
        role = Role(name=name, description=description)
        self.session.add(role)
        await self.session.flush()
        _ROLE_MEMORY_CACHE[name] = role
        return role
