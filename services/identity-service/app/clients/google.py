import os
import uuid
import httpx
from urllib.parse import urlencode
from typing import Optional, Tuple
from shared.exceptions import BadRequestException, ServiceUnavailableException
from ..schemas.auth import GoogleProfile

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "mock_google_client_id")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "mock_google_client_secret")
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URI = "https://www.googleapis.com/oauth2/v2/userinfo"

class GoogleOAuthClient:
    """Async HTTP Client for Google OAuth 2.0 interaction."""

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

    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> str:
        """Exchanges OAuth code for Google access token."""
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
                token = payload.get("access_token")
                if not token:
                    raise BadRequestException("No access_token returned by Google")
                return token
        except httpx.RequestError as exc:
            raise ServiceUnavailableException(f"Google OAuth service connection error: {str(exc)}")

    async def get_user_info(self, access_token: str) -> GoogleProfile:
        """Fetches Google user profile using access token."""
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
                    picture=data.get("picture"),
                )
        except httpx.RequestError as exc:
            raise ServiceUnavailableException(f"Google UserInfo API connection error: {str(exc)}")
