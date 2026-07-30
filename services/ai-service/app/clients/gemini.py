import os
import logging
from typing import Optional, Any, AsyncGenerator
from shared.config import settings
from .base import BaseAIProvider

logger = logging.getLogger(__name__)

class GeminiFlashProvider(BaseAIProvider):
    """AI Provider implementation for Google Gemini Direct Engine (gemini-flash-latest)."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or settings.ai.gemini_api_key or ""
        self.model_name = os.getenv("LLM_PRIMARY_MODEL") or settings.ai.llm_primary_model or "gemini-3.6-flash"

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        try:
            import google.generativeai as genai
            if self.api_key:
                genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction,
            )
            response = await model.generate_content_async(prompt)
            return response.text if response and hasattr(response, "text") else ""
        except Exception as exc:
            logger.warning(f"Gemini Flash fallback text response notice: {exc}")
            return f"[Gemini Flash Response for: '{prompt[:50]}...']"

    async def generate_structured(
        self,
        prompt: str,
        schema: Any,
        system_instruction: Optional[str] = None,
    ) -> Any:
        try:
            import google.generativeai as genai
            if self.api_key:
                genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction,
                generation_config={"response_mime_type": "application/json"}
            )
            response = await model.generate_content_async(prompt)
            return response.text if response and hasattr(response, "text") else "{}"
        except Exception as exc:
            logger.warning(f"Gemini Flash structured response fallback: {exc}")
            return "{}"

    async def generate_stream(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        try:
            import google.generativeai as genai
            if self.api_key:
                genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction,
            )
            response = await model.generate_content_async(prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as exc:
            logger.warning(f"Gemini Flash stream fallback: {exc}")
            yield f"[Gemini Flash Stream: {prompt[:30]}]"
