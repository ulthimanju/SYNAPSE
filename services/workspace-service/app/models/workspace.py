from datetime import datetime, timezone
from beanie import Document, Indexed
from pydantic import Field

class Workspace(Document):
    """Beanie MongoDB Model for Workspace."""
    name: str = Field(..., max_length=255, description="Workspace name")
    owner_id: Indexed(str) = Field(..., description="User ID of the workspace owner")
    is_shared: bool = Field(default=False, description="Shared workspace boolean flag (True = shared, False = private)")
    is_archived: bool = Field(default=False, description="Archived status flag")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "workspaces"
