import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from shared.logging import initialize_logging, get_logger
from shared.config import settings
from shared.database import mongodb_manager, init_mongo_beanie
from .models.workspace import Workspace
from .models.membership import Membership
from .models.workspace_summary import WorkspaceSummary
from .models.learning_path import LearningPath
from .models.learning_unit_content import LearningUnitContent
from .models.flashcard import Flashcard
from .models.quiz import Quiz
from .models.generation_job import GenerationJob

logger = get_logger("workspace-service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for Workspace Service startup and shutdown events."""
    initialize_logging(service_name="workspace-service")
    logger.info(f"Starting workspace-service (environment: {settings.environment})...")

    try:
        await init_mongo_beanie(document_models=[
            Workspace,
            Membership,
            WorkspaceSummary,
            LearningPath,
            LearningUnitContent,
            Flashcard,
            Quiz,
            GenerationJob,
        ])
        logger.info(f"MongoDB/Beanie initialized with Workspace, Membership, WorkspaceSummary, LearningPath, LearningUnitContent, Flashcard, Quiz & GenerationJob models ({settings.mongodb.db_name})")
    except Exception as exc:
        logger.warning(f"MongoDB connection warning during startup: {exc}")

    yield

    logger.info("Shutting down workspace-service...")
    mongodb_manager.close()
    logger.info("workspace-service shutdown complete.")
