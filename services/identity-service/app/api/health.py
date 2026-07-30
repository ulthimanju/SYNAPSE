from fastapi import APIRouter
from shared.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Returns standardized health status for Identity Service."""
    return HealthResponse(
        service="identity-service",
        status="healthy",
        version="1.0.0"
    )
