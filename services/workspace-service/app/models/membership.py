from datetime import datetime, timezone
from beanie import Document, Indexed
from pydantic import Field

class Membership(Document):
    """Beanie MongoDB Model for Workspace Membership."""
    workspace_id: Indexed(str) = Field(..., description="Workspace ID string")
    user_id: Indexed(str) = Field(..., description="User ID string")
    role: str = Field(default="owner", description="Membership role: 'owner' or 'member'")
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "memberships"
