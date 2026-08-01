from typing import Optional
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from shared.exceptions import UnauthorizedException
from .models import AuthenticatedUser
from .jwt import verify_access_token

security = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthenticatedUser:
    """FastAPI Dependency: Extracts JWT token from HttpOnly Cookie ('access_token') or Bearer Header."""
    token = request.cookies.get("access_token")
    if not token and credentials and credentials.credentials:
        token = credentials.credentials

    if not token:
        raise UnauthorizedException("Missing or invalid authentication token")
    return verify_access_token(token)

async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthenticatedUser]:
    """FastAPI Dependency: Returns AuthenticatedUser if valid token present, otherwise None."""
    token = request.cookies.get("access_token")
    if not token and credentials and credentials.credentials:
        token = credentials.credentials

    if not token:
        return None
    try:
        return verify_access_token(token)
    except Exception:
        return None

async def require_authenticated_user(
    user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """FastAPI Dependency: Explicit alias ensuring authenticated user."""
    return user
