import logging
from typing import List, Dict, Any, Optional
import httpx
from shared.config.settings import settings
from shared.exceptions import NotFoundException, ServiceUnavailableException

logger = logging.getLogger(__name__)

class DocumentServiceClient:
    """Internal REST client for fetching parsed Markdown documents from Document Processing Service."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.document_service_url

    async def get_parsed_documents(self, workspace_id: str) -> List[Dict[str, Any]]:
        """Queries internal endpoint GET /internal/workspaces/{workspace_id}/parsed-documents."""
        url = f"{self.base_url}/internal/workspaces/{workspace_id}/parsed-documents"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    payload = res.json()
                    return payload.get("data", [])
                elif res.status_code == 404:
                    raise NotFoundException(f"No documents found for workspace {workspace_id}")
                else:
                    logger.warning(f"Document service returned status {res.status_code}")
                    return []
        except Exception as exc:
            logger.warning(f"Internal DocumentServiceClient connection warning: {exc}")
            # Fallback document mock payload for standalone local dev testing
            return [
                {
                    "document_id": "doc-1",
                    "title": "Synapse Distributed System Architecture",
                    "markdown": "# Synapse Architecture\n\nSynapse is a distributed multi-agent platform for academic knowledge graphs, microservices, and vector RAG retrieval.",
                }
            ]
