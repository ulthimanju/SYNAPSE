from fastapi import APIRouter, Depends, status
from shared.schemas import APIResponse
from ..services.learning_path_service import LearningPathService
from ..schemas.learning_path import LearningPathRequest, LearningPathResponse

router = APIRouter(tags=["AI Learning Path"])

def get_learning_path_service() -> LearningPathService:
    return LearningPathService()

@router.post("/learning-path", response_model=APIResponse[LearningPathResponse])
async def generate_learning_path(
    payload: LearningPathRequest,
    service: LearningPathService = Depends(get_learning_path_service),
) -> APIResponse[LearningPathResponse]:
    """Generates structured dependency-aware learning path for a workspace using Gemini 2.5 Flash."""
    result = await service.generate_learning_path(workspace_id=payload.workspace_id)
    return APIResponse(message="Learning path generated successfully.", data=result)
