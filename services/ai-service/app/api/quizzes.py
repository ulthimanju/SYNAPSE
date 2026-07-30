from fastapi import APIRouter, Depends, status
from shared.schemas import APIResponse
from ..services.quiz_service import QuizService
from ..schemas.quizzes import QuizzesRequest, QuizzesResponse

router = APIRouter(tags=["AI Quizzes"])

def get_quiz_service() -> QuizService:
    return QuizService()

@router.post("/quizzes", response_model=APIResponse[QuizzesResponse])
async def generate_quiz(
    payload: QuizzesRequest,
    service: QuizService = Depends(get_quiz_service),
) -> APIResponse[QuizzesResponse]:
    """Generates structured multiple-choice quiz assessment for a workspace using Gemini 2.5 Flash."""
    result = await service.generate_quiz(workspace_id=payload.workspace_id)
    return APIResponse(message="Quiz generated successfully.", data=result)
