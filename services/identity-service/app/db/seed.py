import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from shared.database import postgres_manager, Base
from ..repositories.role_repository import RoleRepository
from ..models import User, Role, user_roles

logger = logging.getLogger(__name__)

DEFAULT_ROLES = [
    {"name": "student", "description": "Student role with standard workspace access"},
    {"name": "admin", "description": "Administrator role with full system management permissions"},
]

async def seed_roles(session: AsyncSession) -> None:
    """Ensures required student and admin roles exist in the database."""
    role_repo = RoleRepository(session)
    for role_data in DEFAULT_ROLES:
        existing = await role_repo.get_role_by_name(role_data["name"])
        if not existing:
            await role_repo.create_role(name=role_data["name"], description=role_data["description"])
            logger.info(f"Seeded role: {role_data['name']}")
    await session.commit()

async def init_and_seed_db() -> None:
    """Creates database tables, drops deprecated avatar_url column, and seeds default roles."""
    try:
        engine = postgres_manager.engine
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # Remove deprecated avatar_url column if exists
            await conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;"))
        logger.info("Identity Service PostgreSQL tables verified/created successfully.")

        async with postgres_manager.session_factory() as session:
            await seed_roles(session)
        logger.info("Identity Service default roles verified/seeded successfully.")
    except Exception as exc:
        logger.warning(f"Database initialization / role seeding warning: {exc}")
