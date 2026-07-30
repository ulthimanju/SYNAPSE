from datetime import datetime, timezone
from typing import List, Dict, Any
from beanie import Document, Indexed
from pydantic import Field

class Quiz(Document):
    """Beanie MongoDB Model for Quiz Assessment persistence."""
    workspace_id: Indexed(str) = Field(..., description="Workspace ID string")
    title: str = Field(default="Workspace Concept Mastery Quiz", max_length=255, description="Quiz title")
    questions: List[Dict[str, Any]] = Field(default_factory=list, description="Array of multiple-choice question objects")
    version: int = Field(default=1, ge=1, description="Schema version indicator")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "quizzes"
