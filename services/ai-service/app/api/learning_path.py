from fastapi import APIRouter, Depends, status
from shared.schemas import APIResponse
from ..services.learning_path_service import LearningPathService
from ..services.unit_content_service import UnitContentService
from ..schemas.learning_path import LearningPathRequest, LearningPathResponse
from ..schemas.unit_content import UnitContentRequest, UnitContentResponse

router = APIRouter(tags=["AI Learning Path"])

def get_learning_path_service() -> LearningPathService:
    return LearningPathService()

def get_unit_content_service() -> UnitContentService:
    return UnitContentService()

@router.post("/learning-path", response_model=APIResponse[LearningPathResponse])
async def generate_learning_path(
    payload: LearningPathRequest,
    service: LearningPathService = Depends(get_learning_path_service),
) -> APIResponse[LearningPathResponse]:
    """Generates structured dependency-aware learning path for a workspace using Gemini Direct Engine."""
    result = await service.generate_learning_path(workspace_id=payload.workspace_id)
    return APIResponse(message="Learning path generated successfully.", data=result)

@router.post("/learning-unit-content", response_model=APIResponse[UnitContentResponse])
async def generate_learning_unit_content(
    payload: UnitContentRequest,
    service: UnitContentService = Depends(get_unit_content_service),
) -> APIResponse[UnitContentResponse]:
    """Generates concept-specific Summary + Flashcards + Quiz for a target Learning Unit."""
    result = await service.generate_unit_content(payload)
    return APIResponse(message="Learning unit content generated successfully.", data=result)
