from typing import List
from pydantic import BaseModel, Field

class AuthenticatedUser(BaseModel):
    """Common authenticated user model shared across all microservices."""
    user_id: str = Field(..., description="Unique user identification string")
    email: str = Field(..., description="User primary email address")
    roles: List[str] = Field(default_factory=list, description="List of user roles (e.g. ['student'], ['admin'])")
