import os
from typing import Optional
from urllib.parse import quote
from fastapi import APIRouter, Depends, Query, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from shared.schemas import APIResponse
from shared.auth import get_current_user, get_optional_user, AuthenticatedUser
from ..db import get_db
from ..services.auth_service import AuthService
from ..schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEFAULT_GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback"
)

IS_PROD = os.getenv("ENVIRONMENT", "development").lower() == "production"

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Sets HttpOnly Secure cookies for access_token (15m) and refresh_token (30d)."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=900,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=30 * 86400,
        path="/",
    )

def clear_auth_cookies(response: Response):
    """Clears HttpOnly cookies upon logout or session invalidation."""
    response.set_cookie(key="access_token", value="", max_age=0, expires=0, path="/", samesite="lax", httponly=True, secure=IS_PROD)
    response.set_cookie(key="refresh_token", value="", max_age=0, expires=0, path="/", samesite="lax", httponly=True, secure=IS_PROD)

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
    """Processes Google OAuth callback, sets HttpOnly cookies, and redirects to frontend."""
    auth_service = AuthService(session)
    token_response = await auth_service.handle_google_callback(code=code, redirect_uri=redirect_uri)

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    user_info = token_response.user

    email_q = quote(user_info.email or "")
    name_q = quote(user_info.full_name or "")

    redirect_to = f"{frontend_url}/auth/callback?token={token_response.access_token}&email={email_q}&name={name_q}"
    resp = RedirectResponse(url=redirect_to, status_code=302)
    set_auth_cookies(resp, token_response.access_token, token_response.refresh_token)
    return resp

@router.get("/session", response_model=APIResponse[dict])
async def get_session(
    current_user: AuthenticatedUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
) -> APIResponse[dict]:
    """Returns active session payload with user profile, roles, and permissions."""
    auth_service = AuthService(session)
    user_profile = await auth_service.get_current_user_profile(user_id_str=current_user.user_id)
    return APIResponse(
        message="Active session verified",
        data={
            "user": user_profile,
            "roles": current_user.roles,
            "authenticated": True,
        }
    )

@router.post("/refresh")
async def refresh_session(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db)
) -> APIResponse[dict]:
    """Rotates refresh token and issues fresh HttpOnly access & refresh cookies."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        # Fallback to JSON body if passed
        try:
            body = await request.json()
            refresh_token = body.get("refresh_token")
        except Exception:
            pass

    if not refresh_token:
        clear_auth_cookies(response)
        return JSONResponse(status_code=401, content={"message": "Missing refresh token"})

    auth_service = AuthService(session)
    try:
        token_resp = await auth_service.rotate_refresh_token(old_refresh_token=refresh_token)
        res = JSONResponse(
            status_code=200,
            content={"message": "Token refreshed successfully", "data": {"user": token_resp.user.model_dump(mode="json")}}
        )
        set_auth_cookies(res, token_resp.access_token, token_resp.refresh_token)
        return res
    except Exception as exc:
        res = JSONResponse(status_code=401, content={"message": str(exc)})
        clear_auth_cookies(res)
        return res

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user),
    session: AsyncSession = Depends(get_db)
) -> APIResponse[dict]:
    """Clears HttpOnly auth cookies and revokes active session in Redis."""
    auth_service = AuthService(session)
    
    if current_user:
        await auth_service.logout_user(user_id=current_user.user_id)
    else:
        # Extract user_id from refresh token if present
        ref_token = request.cookies.get("refresh_token")
        if ref_token:
            try:
                from shared.auth import decode_access_token
                payload = decode_access_token(ref_token)
                uid = payload.get("sub")
                if uid:
                    await auth_service.logout_user(user_id=uid)
            except Exception:
                pass

    res = JSONResponse(status_code=200, content={"message": "Logged out successfully"})
    clear_auth_cookies(res)
    return res

@router.get("/status")
async def auth_status(
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
) -> APIResponse[dict]:
    """Lightweight authentication status check."""
    return APIResponse(
        message="Auth status check completed",
        data={
            "authenticated": current_user is not None,
            "user_id": current_user.user_id if current_user else None,
        }
    )

@router.get("/me", response_model=APIResponse[UserRead])
async def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
) -> APIResponse[UserRead]:
    """Returns profile for currently authenticated user."""
    auth_service = AuthService(session)
    user_profile = await auth_service.get_current_user_profile(user_id_str=current_user.user_id)
    return APIResponse(message="Authenticated user profile retrieved", data=user_profile)
