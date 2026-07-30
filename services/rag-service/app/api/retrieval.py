from fastapi import APIRouter, Depends, status
from shared.schemas import APIResponse
from ..services.retrieval_service import RetrievalService
from ..schemas.retrieval import RetrievalRequest, RetrievalResponse

router = APIRouter(tags=["Retrieval"])

def get_retrieval_service() -> RetrievalService:
    return RetrievalService()

@router.post("/retrieve", response_model=APIResponse[RetrievalResponse])
async def retrieve_chunks(
    payload: RetrievalRequest,
    service: RetrievalService = Depends(get_retrieval_service),
) -> APIResponse[RetrievalResponse]:
    """Retrieves top-k vector similar chunks for a user query."""
    result = await service.retrieve_similar_chunks(
        workspace_id=payload.workspace_id,
        query=payload.query,
        top_k=payload.top_k
    )
    return APIResponse(message="Retrieved similar document chunks successfully.", data=result)
