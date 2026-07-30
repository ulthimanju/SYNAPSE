from fastapi import APIRouter
from shared.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Returns standardized health status for Workspace Service."""
    return HealthResponse(
        service="workspace-service",
        status="healthy",
        version="1.0.0"
    )
