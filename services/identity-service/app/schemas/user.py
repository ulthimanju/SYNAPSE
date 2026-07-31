import uuid
from datetime import datetime
from typing import List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from .role import RoleRead

class UserCreate(BaseModel):
    """Schema for creating a user."""
    email: EmailStr = Field(..., description="User email address")
    full_name: str | None = Field(default=None, max_length=255, description="Full name")

class UserRead(BaseModel):
    """Schema for reading user data."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str | None = None
    is_active: bool
    roles: List[RoleRead] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
