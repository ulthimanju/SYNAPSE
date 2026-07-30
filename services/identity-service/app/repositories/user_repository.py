import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user import User
from ..models.role import Role

class UserRepository:
    """Repository for managing User entities in PostgreSQL."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(
        self,
        email: str,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        roles: Optional[List[Role]] = None
    ) -> User:
        user = User(
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
            roles=roles or [],
        )
        self.session.add(user)
        await self.session.flush()
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return await self.session.get(User, user_id)

    async def assign_role(self, user: User, role: Role) -> User:
        if role not in user.roles:
            user.roles.append(role)
            await self.session.flush()
        return user
