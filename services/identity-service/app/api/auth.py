import os
from urllib.parse import quote
from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from shared.schemas import APIResponse
from shared.auth import get_current_user, AuthenticatedUser
from ..db import get_db
from ..services.auth_service import AuthService
from ..schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEFAULT_GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback"
)

@router.get("/google/login", status_code=302)
async def google_login(
    redirect_uri: str = Query(default=DEFAULT_GOOGLE_REDIRECT_URI, description="OAuth callback redirect URI"),
    session: AsyncSession = Depends(get_db)
) -> RedirectResponse:
    """Redirects directly to Google OAuth consent screen (302 Redirect)."""
    auth_service = AuthService(session)
    result = auth_service.get_google_login_url(redirect_uri=redirect_uri)
    return RedirectResponse(url=result.auth_url, status_code=302)

@router.get("/google/callback")
async def google_callback(
    code: str = Query(..., description="OAuth 2.0 authorization code from Google"),
    redirect_uri: str = Query(default=DEFAULT_GOOGLE_REDIRECT_URI, description="OAuth callback redirect URI"),
    session: AsyncSession = Depends(get_db)
) -> RedirectResponse:
    """Processes Google OAuth callback, provisions user account, and redirects to frontend with JWT token & profile."""
    auth_service = AuthService(session)
    token_response = await auth_service.handle_google_callback(code=code, redirect_uri=redirect_uri)
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    access_token = token_response.access_token
    user_info = token_response.user

    email_q = quote(user_info.email or "")
    name_q = quote(user_info.full_name or "")

    redirect_to = f"{frontend_url}/auth/callback?token={access_token}&email={email_q}&name={name_q}"
    return RedirectResponse(url=redirect_to, status_code=302)

@router.get("/me", response_model=APIResponse[UserRead])
async def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
) -> APIResponse[UserRead]:
    """Returns profile for currently authenticated user."""
    auth_service = AuthService(session)
    user_profile = await auth_service.get_current_user_profile(user_id_str=current_user.user_id)
    return APIResponse(message="Authenticated user profile retrieved", data=user_profile)
