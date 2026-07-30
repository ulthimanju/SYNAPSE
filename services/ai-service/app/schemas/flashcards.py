from typing import List
from pydantic import BaseModel, Field

class FlashcardItem(BaseModel):
    """Schema for individual flashcard item."""
    id: str = Field(..., description="Unique card identifier")
    unit_id: str = Field(..., description="Originating learning unit ID")
    question: str = Field(..., description="Conceptual question text")
    answer: str = Field(..., description="Concise answer text")
    difficulty: str = Field(default="Medium", description="Card difficulty: 'Easy', 'Medium', 'Hard'")
    tags: List[str] = Field(default_factory=list, description="Associated topic tags")

class FlashcardsRequest(BaseModel):
    """Input payload requesting flashcard generation."""
    workspace_id: str = Field(..., description="Target Workspace ID string")

class FlashcardsResponse(BaseModel):
    """Structured response payload for flashcard deck."""
    workspace_id: str = Field(..., description="Target Workspace ID string")
    flashcards: List[FlashcardItem] = Field(default_factory=list, description="Array of generated flashcard items")
