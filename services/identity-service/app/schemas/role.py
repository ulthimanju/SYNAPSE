import uuid
from pydantic import BaseModel, Field, ConfigDict

class RoleCreate(BaseModel):
    """Schema for creating a role."""
    name: str = Field(..., max_length=50, description="Role name (e.g. 'student', 'admin')")
    description: str | None = Field(default=None, max_length=255, description="Role description")

class RoleRead(BaseModel):
    """Schema for reading role data."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None
