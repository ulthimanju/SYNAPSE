import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from shared.logging import initialize_logging, get_logger
from shared.config import settings
from shared.database import vectors_postgres_manager, mongodb_manager, init_mongo_beanie
from .models.conversation import Conversation
from .models.message import ChatMessage

logger = get_logger("rag-service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for RAG Service startup and shutdown events."""
    # 1. Startup: Initialize Logging, PostgreSQL Engine, & MongoDB Beanie
    initialize_logging(service_name="rag-service")
    logger.info(f"Starting rag-service (environment: {settings.environment})...")
    
    try:
        async with vectors_postgres_manager.engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS document_chunk_embeddings (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    chunk_id VARCHAR NOT NULL,
                    document_id VARCHAR NOT NULL,
                    workspace_id VARCHAR NOT NULL,
                    embedding vector(768) NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_chunk_embeddings_workspace ON document_chunk_embeddings(workspace_id);"))
        logger.info(f"PostgreSQL pgvector database initialized for RAG Service ({settings.postgres.db_vectors})")
    except Exception as exc:
        logger.warning(f"PostgreSQL connection warning during startup: {exc}")

    try:
        await init_mongo_beanie(document_models=[Conversation, ChatMessage])
        logger.info(f"MongoDB/Beanie initialized with Conversation & ChatMessage models ({settings.mongodb.db_name})")
    except Exception as exc:
        logger.warning(f"MongoDB connection warning during startup: {exc}")

    yield

    # 2. Shutdown: Close connections
    logger.info("Shutting down rag-service...")
    await vectors_postgres_manager.close()
    mongodb_manager.close()
    logger.info("rag-service shutdown complete.")
