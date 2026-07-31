import os
import logging
from abc import ABC, abstractmethod
from typing import List
from shared.cache.redis_client import redis_cache_manager

logger = logging.getLogger(__name__)

class BaseEmbeddingClient(ABC):
    """Abstract Base Class for Embedding generation clients."""
    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        pass

class GeminiEmbeddingClient(BaseEmbeddingClient):
    """Gemini Embedding Client with Redis Vector Query Caching."""
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = model or os.getenv("EMBEDDING_MODEL", "models/gemini-embedding-001")

    async def get_embedding(self, text: str) -> List[float]:
        if not text:
            return [0.0] * 768

        # 1. Check Redis Cache first (sub-millisecond hit!)
        cached_vector = await redis_cache_manager.get_embedding_cache(text, self.model)
        if cached_vector:
            return cached_vector

        # 2. Cache miss -> Call Gemini Embedding API over network
        try:
            import google.generativeai as genai
            if self.api_key:
                genai.configure(api_key=self.api_key)
            response = genai.embed_content(
                model=self.model,
                content=text,
                task_type="retrieval_query",
                output_dimensionality=768,
            )
            embedding = response.get("embedding", [])
            vec = embedding[:768] if len(embedding) >= 768 else [0.0] * 768
            
            # 3. Cache generated 768-dim vector in Redis (7 days TTL)
            if len(vec) == 768 and vec != [0.0] * 768:
                await redis_cache_manager.set_embedding_cache(text, self.model, vec)

            return vec
        except Exception as exc:
            logger.warning(f"Gemini query embedding generation notice: {exc}. Returning deterministic query vector.")
            import hashlib
            seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16)
            import random
            rng = random.Random(seed)
            return [rng.uniform(-0.1, 0.1) for _ in range(768)]

class MockEmbeddingClient(BaseEmbeddingClient):
    """Deterministic Mock Embedding Client returning 768-dim float vectors."""
    async def get_embedding(self, text: str) -> List[float]:
        import hashlib, random
        seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16)
        rng = random.Random(seed)
        return [rng.uniform(-0.1, 0.1) for _ in range(768)]

def get_embedding_client() -> BaseEmbeddingClient:
    """Factory function returning configured embedding client."""
    provider = os.getenv("EMBEDDING_PROVIDER", "gemini").lower()
    if provider == "mock":
        return MockEmbeddingClient()
    return GeminiEmbeddingClient()
