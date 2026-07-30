import os
import logging
from typing import Optional, Any, AsyncGenerator
from shared.config import settings
from .base import BaseAIProvider

logger = logging.getLogger(__name__)

class GeminiFlashProvider(BaseAIProvider):
    """AI Provider implementation for Google Gemini Engine with automatic rate-limit fallback."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or settings.ai.gemini_api_key or ""
        self.model_name = os.getenv("LLM_PRIMARY_MODEL") or settings.ai.llm_primary_model or "gemini-3.6-flash"

    def _is_rate_limit_error(self, exc: Exception) -> bool:
        err_str = str(exc).lower()
        return "429" in err_str or "quota" in err_str or "rate limit" in err_str or "resourceexhausted" in err_str

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        import google.generativeai as genai
        if self.api_key:
            genai.configure(api_key=self.api_key)

        raw_models = [self.model_name, "models/gemini-3.6-flash", "models/gemini-3.5-flash", "models/gemini-flash-latest"]
        models_to_try = []
        for rm in raw_models:
            m_name = rm if rm.startswith("models/") else f"models/{rm}"
            if m_name not in models_to_try:
                models_to_try.append(m_name)

        last_exc = None
        for m_name in models_to_try:
            try:
                model = genai.GenerativeModel(
                    model_name=m_name,
                    system_instruction=system_instruction,
                )
                response = await model.generate_content_async(prompt)
                if response and hasattr(response, "text") and response.text:
                    return response.text
            except Exception as exc:
                last_exc = exc
                if self._is_rate_limit_error(exc):
                    logger.warning(f"Model '{m_name}' hit rate limit ({exc}). Switching to next fallback model...")
                    continue
                else:
                    raise exc

        if last_exc:
            raise last_exc
        return ""

    async def generate_structured(
        self,
        prompt: str,
        schema: Any,
        system_instruction: Optional[str] = None,
    ) -> Any:
        import google.generativeai as genai
        if self.api_key:
            genai.configure(api_key=self.api_key)

        models_to_try = [self.model_name]
        if self.model_name != "gemini-2.5-flash":
            models_to_try.append("gemini-2.5-flash")

        last_exc = None
        for m_name in models_to_try:
            try:
                model = genai.GenerativeModel(
                    model_name=m_name,
                    system_instruction=system_instruction,
                    generation_config={"response_mime_type": "application/json"}
                )
                response = await model.generate_content_async(prompt)
                if response and hasattr(response, "text") and response.text:
                    return response.text
            except Exception as exc:
                last_exc = exc
                if self._is_rate_limit_error(exc) and m_name != "gemini-2.5-flash":
                    logger.warning(f"Model '{m_name}' hit rate limit ({exc}). Switching fallback model to 'gemini-2.5-flash'...")
                    continue
                else:
                    raise exc

        if last_exc:
            raise last_exc
        return "{}"

    async def generate_stream(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        import google.generativeai as genai
        if self.api_key:
            genai.configure(api_key=self.api_key)

        models_to_try = [self.model_name]
        if self.model_name != "gemini-2.5-flash":
            models_to_try.append("gemini-2.5-flash")

        for m_name in models_to_try:
            try:
                model = genai.GenerativeModel(
                    model_name=m_name,
                    system_instruction=system_instruction,
                )
                response = await model.generate_content_async(prompt, stream=True)
                async for chunk in response:
                    if chunk.text:
                        yield chunk.text
                return
            except Exception as exc:
                if self._is_rate_limit_error(exc) and m_name != "gemini-2.5-flash":
                    logger.warning(f"Model '{m_name}' stream hit rate limit ({exc}). Switching fallback model to 'gemini-2.5-flash'...")
                    continue
                else:
                    raise exc
