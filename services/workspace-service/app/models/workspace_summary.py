from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from beanie import Document, Indexed
from pydantic import Field

class WorkspaceSummary(Document):
    """Beanie MongoDB Model for Workspace Summary persistence."""
    workspace_id: Indexed(str) = Field(..., description="Workspace ID string")
    title: str = Field(..., max_length=255, description="Executive summary title")
    overview: str = Field(..., description="Synthesized overview text")
    visualizations: List[Dict[str, Any]] = Field(default_factory=list, description="Diagram visualizations")
    comparison_tables: List[Dict[str, Any]] = Field(default_factory=list, description="Comparison tables")
    code_examples: List[Dict[str, Any]] = Field(default_factory=list, description="Code examples")
    key_topics: List[str] = Field(default_factory=list, description="Extracted key topics")
    difficulty: str = Field(default="Intermediate", description="Target difficulty level")
    estimated_study_time: str = Field(default="6 hours", description="Estimated study time required")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "workspace_summaries"
