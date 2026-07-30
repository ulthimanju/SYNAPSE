import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from shared.auth import create_access_token
from shared.exceptions import NotFoundException, BadRequestException
from ..repositories.user_repository import UserRepository
from ..repositories.role_repository import RoleRepository
from ..clients.google import GoogleOAuthClient
from ..schemas.auth import GoogleAuthUrlResponse, TokenResponse, GoogleProfile
from ..schemas.user import UserRead

class AuthService:
    """Service layer handling Authentication & User Provisioning."""

    def __init__(self, session: AsyncSession, google_client: Optional[GoogleOAuthClient] = None):
        self.session = session
        self.user_repo = UserRepository(session)
        self.role_repo = RoleRepository(session)
        self.google_client = google_client or GoogleOAuthClient()

    def get_google_login_url(self, redirect_uri: str) -> GoogleAuthUrlResponse:
        """Returns Google consent URL and state."""
        url, state = self.google_client.get_authorization_url(redirect_uri=redirect_uri)
        return GoogleAuthUrlResponse(auth_url=url, state=state)

    async def handle_google_callback(self, code: str, redirect_uri: str) -> TokenResponse:
        """Processes Google OAuth callback code, provisions user if missing, and issues Synapse JWT."""
        # 1. Exchange code for Google token
        google_access_token = await self.google_client.exchange_code_for_token(code=code, redirect_uri=redirect_uri)

        # 2. Get user info
        profile: GoogleProfile = await self.google_client.get_user_info(access_token=google_access_token)

        # 3. Lookup user or create new user
        user = await self.user_repo.get_user_by_email(email=profile.email)
        if not user:
            student_role = await self.role_repo.get_role_by_name("student")
            roles_list = [student_role] if student_role else []

            user = await self.user_repo.create_user(
                email=profile.email,
                full_name=profile.name,
                avatar_url=profile.picture,
                roles=roles_list
            )
        else:
            if profile.name and not user.full_name:
                user.full_name = profile.name
            if profile.picture and not user.avatar_url:
                user.avatar_url = profile.picture

        await self.session.commit()

        # 4. Issue Synapse JWT Access & Refresh Tokens
        role_names = [r.name for r in user.roles]
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "roles": role_names,
            "google_token": google_access_token,
        }
        access_token = create_access_token(data=token_data)
        refresh_token = create_access_token(data={"sub": str(user.id), "type": "refresh"})

        user_read = UserRead.model_validate(user)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=3600,
            user=user_read
        )

    async def get_current_user_profile(self, user_id_str: str) -> UserRead:
        """Returns UserRead profile for current authenticated user ID."""
        try:
            uid = uuid.UUID(user_id_str)
            user = await self.user_repo.get_user_by_id(uid)
        except Exception:
            user = None

        if not user:
            raise NotFoundException("User profile not found")

        return UserRead.model_validate(user)
