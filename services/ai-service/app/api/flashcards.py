from fastapi import APIRouter, Depends, status
from shared.schemas import APIResponse
from ..services.flashcard_service import FlashcardService
from ..schemas.flashcards import FlashcardsRequest, FlashcardsResponse

router = APIRouter(tags=["AI Flashcards"])

def get_flashcard_service() -> FlashcardService:
    return FlashcardService()

@router.post("/flashcards", response_model=APIResponse[FlashcardsResponse])
async def generate_flashcards(
    payload: FlashcardsRequest,
    service: FlashcardService = Depends(get_flashcard_service),
) -> APIResponse[FlashcardsResponse]:
    """Generates structured conceptual flashcards for a workspace using Gemini 2.5 Flash."""
    result = await service.generate_flashcards(workspace_id=payload.workspace_id)
    return APIResponse(message="Flashcards generated successfully.", data=result)
