from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from beanie import Document, Indexed
from pydantic import Field

class LearningPath(Document):
    """Beanie MongoDB Model for Workspace Learning Path persistence."""
    workspace_id: Indexed(str) = Field(..., description="Workspace ID string")
    title: str = Field(..., max_length=255, description="Learning path title")
    description: Optional[str] = Field(default="Comprehensive curriculum roadmap.", description="Curriculum description")
    estimated_total_time: Optional[str] = Field(default="10 hours", description="Total study time estimation")
    difficulty: Optional[str] = Field(default="Intermediate", description="Overall difficulty level")
    units: List[Dict[str, Any]] = Field(default_factory=list, description="Ordered sequence of learning units")
    version: int = Field(default=2, ge=1, description="Schema version indicator")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "learning_paths"
