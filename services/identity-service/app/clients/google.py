import os
import uuid
import httpx
import jwt
import logging
from urllib.parse import urlencode
from typing import Optional, Tuple
from shared.exceptions import BadRequestException, ServiceUnavailableException
from ..schemas.auth import GoogleProfile

logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "mock_google_client_id")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "mock_google_client_secret")
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URI = "https://www.googleapis.com/oauth2/v2/userinfo"

class GoogleOAuthClient:
    """Async HTTP Client for Google OAuth 2.0 interaction with id_token decoding optimization."""

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None
    ):
        self.client_id = client_id or GOOGLE_CLIENT_ID
        self.client_secret = client_secret or GOOGLE_CLIENT_SECRET

    def get_authorization_url(self, redirect_uri: str, state: Optional[str] = None) -> Tuple[str, str]:
        """Generates Google OAuth consent screen URL and CSRF state string."""
        state_str = state or str(uuid.uuid4())
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile https://www.googleapis.com/auth/drive.file",
            "access_type": "offline",
            "state": state_str,
            "prompt": "consent",
        }
        url = f"{GOOGLE_AUTH_URI}?{urlencode(params)}"
        return url, state_str

    async def exchange_code_and_get_profile(self, code: str, redirect_uri: str) -> Tuple[str, Optional[str], GoogleProfile]:
        """Exchanges OAuth code for Google access token and refresh token, and extracts user profile directly from id_token JWT."""
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(GOOGLE_TOKEN_URI, data=data)
                if not res.is_success:
                    raise BadRequestException(f"Failed to exchange Google OAuth code: {res.text}")
                payload = res.json()
                access_token = payload.get("access_token")
                refresh_token = payload.get("refresh_token")
                id_token_jwt = payload.get("id_token")

                if not access_token:
                    raise BadRequestException("No access_token returned by Google")

                # Optimization 1: Decode id_token claims locally to skip 2nd HTTP call
                if id_token_jwt:
                    try:
                        claims = jwt.decode(id_token_jwt, options={"verify_signature": False})
                        profile = GoogleProfile(
                            id=claims.get("sub", str(uuid.uuid4())),
                            email=claims.get("email", ""),
                            name=claims.get("name"),
                        )
                        logger.info(f"⚡ [OAUTH OPTIMIZATION] Decoded Google id_token JWT for '{profile.email}'. Bypassed /userinfo API call!")
                        return access_token, refresh_token, profile
                    except Exception as jwt_exc:
                        logger.warning(f"Failed to decode Google id_token claims locally ({jwt_exc}). Falling back to UserInfo API.")

                # Fallback: Call Google UserInfo API if id_token is unparseable
                profile = await self.get_user_info(access_token)
                return access_token, refresh_token, profile

        except httpx.RequestError as exc:
            raise ServiceUnavailableException(f"Google OAuth service connection error: {str(exc)}")

    async def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """Uses long-lived Google OAuth refresh_token to acquire a fresh Google access_token."""
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(GOOGLE_TOKEN_URI, data=data)
                if res.status_code == 200:
                    payload = res.json()
                    new_access_token = payload.get("access_token")
                    if new_access_token:
                        logger.info("🔄 [GOOGLE OAUTH REFRESH] Successfully refreshed Google access token.")
                        return new_access_token
                logger.warning(f"Google token refresh failed ({res.status_code}): {res.text[:150]}")
                return None
        except Exception as exc:
            logger.warning(f"Google OAuth token refresh exception: {exc}")
            return None

    async def get_user_info(self, access_token: str) -> GoogleProfile:
        """Fetches Google user profile using access token (Fallback endpoint)."""
        headers = {"Authorization": f"Bearer {access_token}"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(GOOGLE_USERINFO_URI, headers=headers)
                if not res.is_success:
                    raise BadRequestException(f"Failed to fetch Google user profile: {res.text}")
                data = res.json()
                return GoogleProfile(
                    id=data["id"],
                    email=data["email"],
                    name=data.get("name"),
                )
        except httpx.RequestError as exc:
            raise ServiceUnavailableException(f"Google UserInfo connection error: {str(exc)}")
        except httpx.RequestError as exc:
            raise ServiceUnavailableException(f"Google UserInfo API connection error: {str(exc)}")
