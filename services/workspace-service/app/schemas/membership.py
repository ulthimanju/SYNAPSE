from datetime import datetime
from pydantic import BaseModel, Field

class MembershipRead(BaseModel):
    """Schema for reading membership details."""
    id: str
    workspace_id: str
    user_id: str
    role: str
    joined_at: datetime
