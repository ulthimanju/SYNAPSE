import os
import logging
from .base import BaseAIProvider
from .gemini import GeminiFlashProvider

logger = logging.getLogger(__name__)

def get_ai_provider() -> BaseAIProvider:
    """Factory function returning configured AI provider based on environment variables."""
    provider_name = os.getenv("AI_PROVIDER", "gemini").lower()
    from shared.config import settings
    logger.info(f"Instantiating AI Provider: {provider_name} (Model: {settings.ai.llm_primary_model})")
    return GeminiFlashProvider()
