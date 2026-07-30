from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed
from pydantic import Field

DEFAULT_SUMMARY_STEPS = [
    {"name": "Workspace Service", "status": "waiting"},
    {"name": "Need Document Contexts", "status": "waiting"},
    {"name": "Call Document Processing Service", "status": "waiting"},
    {"name": "Receive Contexts", "status": "waiting"},
    {"name": "Build AI Request", "status": "waiting"},
    {"name": "Call AI Service", "status": "waiting"},
    {"name": "Receive Summary", "status": "waiting"},
    {"name": "Store Summary", "status": "waiting"},
]

class GenerationJob(Document):
    """Beanie MongoDB Model for Background AI Generation Jobs."""
    workspace_id: Indexed(str) = Field(..., description="Target Workspace ID string")
    job_type: str = Field(..., description="Job type: 'SUMMARY', 'LEARNING_PATH', 'FLASHCARDS', 'QUIZ'")
    status: str = Field(default="QUEUED", description="Job status: 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED'")
    progress: int = Field(default=0, ge=0, le=100, description="Job completion progress percentage (0-100)")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    retry_count: int = Field(default=0, ge=0, description="Number of execution retry attempts")
    ai_model: str = Field(default="gemini-flash-latest", description="AI Model used for execution")
    token_count: Optional[Dict[str, int]] = Field(default=None, description="Input/Output token metric estimations")
    started_at: Optional[datetime] = Field(default=None, description="Timestamp when job execution started")
    completed_at: Optional[datetime] = Field(default=None, description="Timestamp when job execution completed")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    steps: List[Dict[str, Any]] = Field(default_factory=lambda: [dict(s) for s in DEFAULT_SUMMARY_STEPS])

    class Settings:
        name = "generation_jobs"
