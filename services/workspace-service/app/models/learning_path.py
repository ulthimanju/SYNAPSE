from datetime import datetime, timezone
from typing import List, Dict, Any
from beanie import Document, Indexed
from pydantic import Field

class LearningPath(Document):
    """Beanie MongoDB Model for Workspace Learning Path persistence."""
    workspace_id: Indexed(str) = Field(..., description="Workspace ID string")
    title: str = Field(..., max_length=255, description="Learning path title")
    units: List[Dict[str, Any]] = Field(default_factory=list, description="Ordered sequence of learning units")
    version: int = Field(default=1, ge=1, description="Schema version indicator")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "learning_paths"
