import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from shared.logging import initialize_logging, get_logger
from shared.config import settings
from shared.database import postgres_manager
from .db.seed import init_and_seed_db

logger = get_logger("identity-service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for Identity Service startup and shutdown events."""
    # 1. Startup: Initialize Logging
    initialize_logging(service_name="identity-service")
    logger.info(f"Starting identity-service (environment: {settings.environment})...")

    # 2. Connection ping & DB seed check
    try:
        engine = postgres_manager.engine
        logger.info(f"Database engine initialized for {settings.postgres.host}:{settings.postgres.port}")
        await init_and_seed_db()
    except Exception as exc:
        logger.warning(f"Database seed initialization warning during startup: {exc}")

    yield

    # 3. Shutdown: Gracefully close database connection pool
    logger.info("Shutting down identity-service...")
    await postgres_manager.close()
    logger.info("identity-service shutdown complete.")
