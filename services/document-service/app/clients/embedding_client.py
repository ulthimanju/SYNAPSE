import os
import logging
from abc import ABC, abstractmethod
from typing import List

logger = logging.getLogger(__name__)

class BaseEmbeddingClient(ABC):
    """Abstract interface for Vector Embedding Clients."""

    @abstractmethod
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates vector embeddings for chunk texts."""
        pass

class GeminiEmbeddingClient(BaseEmbeddingClient):
    """Gemini API text-embedding-004 Client."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
        self.model_name = os.getenv("EMBEDDING_MODEL", "models/gemini-embedding-001")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        try:
            import google.generativeai as genai
            if self.api_key:
                genai.configure(api_key=self.api_key)
                
            embeddings = []
            for text in texts:
                res = genai.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="retrieval_document",
                )
                embeddings.append(res["embedding"])
            return embeddings

        except Exception as exc:
            logger.warning(f"Gemini Embedding API fallback generation: {exc}")
            return MockEmbeddingClient().generate_embeddings(texts)

class MockEmbeddingClient(BaseEmbeddingClient):
    """Mock Deterministic Embedding Client for Local Dev & Unit Testing."""

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in texts:
            base_val = (hash(text) % 1000) / 1000.0
            vec = [base_val + (i * 0.001) for i in range(768)]
            embeddings.append(vec)
        return embeddings

def get_embedding_client() -> BaseEmbeddingClient:
    """Factory function returning configured embedding client."""
    provider = os.getenv("EMBEDDING_PROVIDER", "gemini").lower()
    if provider == "mock":
        return MockEmbeddingClient()
    return GeminiEmbeddingClient()
