from typing import Optional
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from shared.exceptions import UnauthorizedException
from .models import AuthenticatedUser
from .jwt import verify_access_token

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthenticatedUser:
    """FastAPI Dependency: Ensures request is authenticated and returns AuthenticatedUser."""
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Missing or invalid Authorization header")
    return verify_access_token(credentials.credentials)

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthenticatedUser]:
    """FastAPI Dependency: Returns AuthenticatedUser if valid token present, otherwise None."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return verify_access_token(credentials.credentials)
    except Exception:
        return None

async def require_authenticated_user(
    user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """FastAPI Dependency: Explicit alias ensuring authenticated user."""
    return user
