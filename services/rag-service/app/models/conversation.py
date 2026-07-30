from datetime import datetime, timezone
from beanie import Document, Indexed
from pydantic import Field

class Conversation(Document):
    """Beanie MongoDB Model for Singleton Workspace Conversation."""
    workspace_id: Indexed(str, unique=True) = Field(..., description="Unique workspace ID string")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "conversations"
