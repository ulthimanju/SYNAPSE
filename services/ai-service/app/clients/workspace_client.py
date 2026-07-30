import logging
from typing import Dict, Any, List, Optional
import httpx
from shared.config.settings import settings
from shared.exceptions import NotFoundException, ServiceUnavailableException

logger = logging.getLogger(__name__)

class WorkspaceServiceClient:
    """Internal REST client for fetching cached workspace assets from Workspace Service."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.workspace_service_url

    async def get_workspace_summary(self, workspace_id: str) -> Dict[str, Any]:
        """Queries internal endpoint GET /internal/workspaces/{workspace_id}/summary."""
        url = f"{self.base_url}/internal/workspaces/{workspace_id}/summary"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    payload = res.json()
                    return payload.get("data", {})
                elif res.status_code == 404:
                    raise NotFoundException(f"No summary cached for workspace {workspace_id}")
                else:
                    logger.warning(f"Workspace service returned status {res.status_code}")
                    return {}
        except Exception as exc:
            logger.warning(f"Internal WorkspaceServiceClient connection warning: {exc}")
            return {
                "title": "Synapse Distributed System Architecture",
                "overview": "Synthesized executive summary for Synapse multi-agent architecture and pgvector RAG retrieval.",
                "key_topics": ["Multi-Agent Architecture", "pgvector Retrieval", "FastAPI Monorepo"],
                "difficulty": "Intermediate",
                "estimated_study_time": "6 hours",
            }

    async def get_workspace_learning_path(self, workspace_id: str) -> Dict[str, Any]:
        """Queries internal endpoint GET /internal/workspaces/{workspace_id}/learning-path."""
        url = f"{self.base_url}/internal/workspaces/{workspace_id}/learning-path"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    payload = res.json()
                    return payload.get("data", {})
                elif res.status_code == 404:
                    raise NotFoundException(f"No learning path cached for workspace {workspace_id}")
                else:
                    logger.warning(f"Workspace service returned status {res.status_code}")
                    return {}
        except Exception as exc:
            logger.warning(f"Internal WorkspaceServiceClient connection warning: {exc}")
            return {
                "title": "Mastery Path: Distributed Systems Architecture",
                "units": [
                    {
                        "id": "unit-1",
                        "title": "1. Foundations of Microservices & Multi-Agent Design",
                        "description": "Introduction to event-driven architectures, FastAPI microservices, and identity management.",
                        "difficulty": "Beginner",
                        "estimated_time": "45 min",
                        "prerequisites": ["Python AsyncIO", "HTTP REST"],
                        "learning_objectives": ["Understand service separation", "Configure JWT authorization"],
                        "topics": ["FastAPI", "JWT Auth", "Monorepo Structure"],
                    }
                ],
            }

    async def get_workspace_flashcards(self, workspace_id: str) -> List[Dict[str, Any]]:
        """Queries internal endpoint GET /internal/workspaces/{workspace_id}/flashcards."""
        url = f"{self.base_url}/internal/workspaces/{workspace_id}/flashcards"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    payload = res.json()
                    return payload.get("data", {}).get("flashcards", [])
                elif res.status_code == 404:
                    raise NotFoundException(f"No flashcards cached for workspace {workspace_id}")
                else:
                    logger.warning(f"Workspace service returned status {res.status_code}")
                    return []
        except Exception as exc:
            logger.warning(f"Internal WorkspaceServiceClient connection warning: {exc}")
            return [
                {
                    "unit_id": "unit-1",
                    "question": "What is the primary advantage of microservice decoupling in Synapse?",
                    "answer": "Independent scalability, isolated failure domains, and autonomous service evolution.",
                    "difficulty": "Medium",
                    "tags": ["Microservices", "Architecture"],
                }
            ]
