import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from shared.logging import initialize_logging, get_logger
from shared.config import settings
from .clients.factory import get_ai_provider

logger = get_logger("ai-service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for AI Service startup and shutdown events."""
    # 1. Startup: Initialize Logging & Provider Abstraction
    initialize_logging(service_name="ai-service")
    logger.info(f"Starting ai-service (environment: {settings.environment})...")
    
    provider = get_ai_provider()
    logger.info(f"AI Provider initialized successfully: {provider.__class__.__name__}")

    yield

    logger.info("Shutting down ai-service...")
