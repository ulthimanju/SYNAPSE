import uuid
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from shared.auth import create_access_token
from shared.cache.redis_client import redis_cache_manager
from shared.exceptions import NotFoundException, BadRequestException
from ..repositories.user_repository import UserRepository
from ..repositories.role_repository import RoleRepository
from ..clients.google import GoogleOAuthClient
from ..schemas.auth import GoogleAuthUrlResponse, TokenResponse, GoogleProfile
from ..schemas.user import UserRead

logger = logging.getLogger(__name__)

class AuthService:
    """Service layer handling Authentication & User Provisioning with Redis & JWT optimizations."""

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
        """Processes Google OAuth callback code, decodes id_token JWT directly, provisions user if missing, and issues Synapse JWT."""
        # 1. Exchange code for Google token and extract user profile directly from id_token (bypasses 2nd HTTP API call)
        google_access_token, profile = await self.google_client.exchange_code_and_get_profile(code=code, redirect_uri=redirect_uri)

        # 2. Lookup user or create new user
        user = await self.user_repo.get_user_by_email(email=profile.email)
        if not user:
            student_role = await self.role_repo.get_role_by_name("student")
            roles_list = [student_role] if student_role else []

            user = await self.user_repo.create_user(
                email=profile.email,
                full_name=profile.name,
                roles=roles_list
            )
        else:
            if profile.name and not user.full_name:
                user.full_name = profile.name

        await self.session.commit()

        # 3. Issue Synapse JWT Access & Refresh Tokens
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

        # 4. Cache user profile in Redis for fast /auth/me lookups (15-min TTL)
        try:
            await redis_cache_manager.set_json_cache(CacheKeys.user_profile(str(user.id)), user_read.model_dump(mode="json"), ttl_seconds=900)
            logger.info(f"💾 [REDIS PROFILE CACHED] Cached user profile for '{user.email}' (15m TTL)")
        except Exception as exc:
            logger.warning(f"Redis profile cache save notice: {exc}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=3600,
            user=user_read
        )

    async def get_current_user_profile(self, user_id_str: str) -> UserRead:
        """Returns UserRead profile for current authenticated user ID, leveraging Redis caching."""
        # 1. Check Redis cache first (sub-millisecond hit!)
        try:
            cached_data = await redis_cache_manager.get_json_cache(CacheKeys.user_profile(user_id_str))
            if cached_data:
                logger.info(f"⚡ [REDIS PROFILE CACHE HIT] Bypassed SQL query for user ID '{user_id_str[:8]}'")
                return UserRead.model_validate(cached_data)
        except Exception as exc:
            logger.warning(f"Redis profile cache lookup notice: {exc}")

        # 2. Database lookup on cache miss
        try:
            uid = uuid.UUID(user_id_str)
            user = await self.user_repo.get_user_by_id(uid)
        except Exception:
            user = None

        if not user:
            raise NotFoundException("User profile not found")

        user_read = UserRead.model_validate(user)

        # 3. Cache user profile in Redis for 15 minutes (900 seconds)
        try:
            await redis_cache_manager.set_json_cache(CacheKeys.user_profile(user_id_str), user_read.model_dump(mode="json"), ttl_seconds=900)
        except Exception as exc:
            logger.warning(f"Redis profile cache save notice: {exc}")

        return UserRead.model_validate(user)
