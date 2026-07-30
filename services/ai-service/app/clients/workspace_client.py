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
        """Queries internal endpoint GET /workspaces/internal/workspaces/{workspace_id}/summary."""
        # FIX: workspace-service mounts router with prefix="/workspaces",
        # so all routes are under /workspaces/... not the root.
        url = f"{self.base_url}/workspaces/internal/workspaces/{workspace_id}/summary"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    payload = res.json()
                    return payload.get("data", {})
                elif res.status_code == 404:
                    logger.warning(f"No summary cached for workspace {workspace_id} — summary may not yet be generated.")
                    return {}
                else:
                    logger.warning(f"Workspace service returned status {res.status_code} for summary endpoint.")
                    return {}
        except httpx.ConnectError as exc:
            logger.error(f"Cannot reach workspace-service at {self.base_url}: {exc}")
            raise ServiceUnavailableException("Workspace service is unreachable. Ensure workspace-service is running.")
        except Exception as exc:
            logger.error(f"Unexpected error fetching workspace summary for {workspace_id}: {exc}")
            return {}

    async def get_workspace_learning_path(self, workspace_id: str) -> Dict[str, Any]:
        """Queries internal endpoint GET /workspaces/internal/workspaces/{workspace_id}/learning-path."""
        # FIX: workspace-service mounts router with prefix="/workspaces"
        url = f"{self.base_url}/workspaces/internal/workspaces/{workspace_id}/learning-path"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    payload = res.json()
                    return payload.get("data", {})
                elif res.status_code == 404:
                    logger.warning(f"No learning path cached for workspace {workspace_id}.")
                    return {}
                else:
                    logger.warning(f"Workspace service returned status {res.status_code} for learning-path endpoint.")
                    return {}
        except httpx.ConnectError as exc:
            logger.error(f"Cannot reach workspace-service at {self.base_url}: {exc}")
            raise ServiceUnavailableException("Workspace service is unreachable. Ensure workspace-service is running.")
        except Exception as exc:
            logger.error(f"Unexpected error fetching learning path for {workspace_id}: {exc}")
            return {}

    async def get_workspace_flashcards(self, workspace_id: str) -> List[Dict[str, Any]]:
        """Queries internal endpoint GET /workspaces/internal/workspaces/{workspace_id}/flashcards."""
        # FIX: workspace-service mounts router with prefix="/workspaces"
        url = f"{self.base_url}/workspaces/internal/workspaces/{workspace_id}/flashcards"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    payload = res.json()
                    return payload.get("data", {}).get("flashcards", [])
                elif res.status_code == 404:
                    logger.warning(f"No flashcards cached for workspace {workspace_id}.")
                    return []
                else:
                    logger.warning(f"Workspace service returned status {res.status_code} for flashcards endpoint.")
                    return []
        except httpx.ConnectError as exc:
            logger.error(f"Cannot reach workspace-service at {self.base_url}: {exc}")
            raise ServiceUnavailableException("Workspace service is unreachable. Ensure workspace-service is running.")
        except Exception as exc:
            logger.error(f"Unexpected error fetching flashcards for {workspace_id}: {exc}")
            return []
