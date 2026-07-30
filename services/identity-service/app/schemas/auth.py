from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from .user import UserRead

class GoogleAuthUrlResponse(BaseModel):
    """Response containing Google OAuth Authorization consent URL."""
    auth_url: str = Field(..., description="Google OAuth 2.0 Authorization URL")
    state: str = Field(..., description="CSRF state token")

class GoogleProfile(BaseModel):
    """Google User Profile payload."""
    id: str
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None

class TokenResponse(BaseModel):
    """Synapse Authentication Token Response with Access & Refresh Tokens."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="Refresh token for access token renewal")
    token_type: str = Field(default="Bearer", description="Token type")
    expires_in: int = Field(default=3600, description="Access token expiration time in seconds")
    user: UserRead = Field(..., description="Authenticated user details")
