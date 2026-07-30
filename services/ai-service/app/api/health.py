from fastapi import APIRouter
from shared.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Returns standardized health status for AI Service."""
    return HealthResponse(
        service="ai-service",
        status="healthy",
        version="1.0.0"
    )
