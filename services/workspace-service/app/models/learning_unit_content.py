from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from beanie import Document, Indexed
from pydantic import Field

class LearningUnitContent(Document):
    """Beanie MongoDB Model for storing on-demand generated Learning Unit Content (Summary + Flashcards + Quiz)."""
    workspace_id: Indexed(str) = Field(..., description="Workspace ID string")
    unit_id: Indexed(str) = Field(..., description="Unit ID string")
    unit_title: str = Field(..., description="Unit Title")
    unit_summary: str = Field(..., description="Concept-specific summary for this unit")
    flashcards: List[Dict[str, Any]] = Field(default_factory=list, description="Concept-specific flashcards")
    quiz: Dict[str, Any] = Field(default_factory=dict, description="Concept-specific quiz")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "learning_unit_contents"
