from fastapi import APIRouter
from shared.schemas import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Returns standardized health status for RAG Service."""
    return HealthResponse(
        service="rag-service",
        status="healthy",
        version="1.0.0"
    )
