import logging
from typing import List, Dict, Any, Optional
import httpx
from shared.config.settings import settings

logger = logging.getLogger(__name__)

class RAGServiceClient:
    """Internal REST client for vector retrieval from RAG Service."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.rag_service_url

    async def retrieve_grounding_context(
        self,
        workspace_id: str,
        query: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Queries RAG Service POST /retrieve using Unit Title/Query to fetch relevant document chunks."""
        url = f"{self.base_url}/retrieve"
        payload = {
            "workspace_id": workspace_id,
            "query": query,
            "top_k": top_k
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json().get("data", {})
                    results = data.get("results", [])
                    logger.info(f"Retrieved {len(results)} RAG grounding chunks for query '{query}'")
                    return results
                else:
                    logger.warning(f"RAG service returned status code {res.status_code}")
                    return []
        except Exception as exc:
            logger.warning(f"Internal RAGServiceClient connection warning: {exc}")
            return []
