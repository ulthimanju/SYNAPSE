from datetime import datetime, timezone
from typing import List, Optional
from beanie import Document, Indexed
from pydantic import Field

class Flashcard(Document):
    """Beanie MongoDB Model for Flashcard persistence."""
    workspace_id: Indexed(str) = Field(..., description="Workspace ID string")
    unit_id: Indexed(str) = Field(..., description="Originating learning unit ID")
    question: str = Field(..., description="Conceptual question text")
    answer: str = Field(..., description="Answer text")
    difficulty: str = Field(default="Medium", description="Card difficulty: 'Easy', 'Medium', 'Hard'")
    tags: List[str] = Field(default_factory=list, description="Associated topic tags")
    version: int = Field(default=1, ge=1, description="Schema version indicator")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "flashcards"
