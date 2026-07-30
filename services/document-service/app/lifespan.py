import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from shared.logging import initialize_logging, get_logger
from shared.config import settings
from shared.database import mongodb_manager, init_mongo_beanie
from .models.document import Document
from .models.parsed_document import ParsedDocument
from .models.document_chunk import DocumentChunk
from .storage.minio_client import MinIOStorageService

logger = get_logger("document-service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for Document Processing Service startup and shutdown events."""
    # 1. Startup: Initialize Logging
    initialize_logging(service_name="document-service")
    logger.info(f"Starting document-service (environment: {settings.environment})...")

    # 2. Connection & Beanie Initialization
    try:
        await init_mongo_beanie(document_models=[Document, ParsedDocument, DocumentChunk])
        logger.info(f"MongoDB/Beanie initialized with Document, ParsedDocument & DocumentChunk models ({settings.mongodb.db_name})")
        
        # Ensure MinIO bucket exists
        storage = MinIOStorageService()
        storage.ensure_bucket()
    except Exception as exc:
        logger.warning(f"Startup initialization warning: {exc}")

    yield

    # 3. Shutdown: Close Motor client connection
    logger.info("Shutting down document-service...")
    mongodb_manager.close()
    logger.info("document-service shutdown complete.")
