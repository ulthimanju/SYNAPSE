from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from shared.config.settings import settings

class PostgresDatabaseManager:
    """Manager for PostgreSQL Async Engine & Session Factories."""

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or settings.postgres.url
        self._engine: Optional[AsyncEngine] = None
        self._session_factory: Optional[async_sessionmaker[AsyncSession]] = None

    @property
    def engine(self) -> AsyncEngine:
        if self._engine is None:
            self._engine = create_async_engine(
                self.db_url,
                echo=settings.is_development,
                future=True,
                pool_pre_ping=True,
            )
        return self._engine

    @property
    def session_factory(self) -> async_sessionmaker[AsyncSession]:
        if self._session_factory is None:
            self._session_factory = async_sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=False,
            )
        return self._session_factory

    async def get_db_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    async def close(self) -> None:
        if self._engine is not None:
            await self._engine.dispose()
            self._engine = None

# Default singleton instance using settings.postgres.url
postgres_manager = PostgresDatabaseManager()

# Singleton instance connecting to vector database (synapse_vectors)
vectors_postgres_manager = PostgresDatabaseManager(db_url=settings.postgres.vectors_url)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI Dependency for obtaining an async PostgreSQL session."""
    async for session in postgres_manager.get_db_session():
        yield session
