import uuid
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from shared.auth import create_access_token
from shared.cache.redis_client import redis_cache_manager, CacheKeys
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
        google_access_token, google_refresh_token, profile = await self.google_client.exchange_code_and_get_profile(code=code, redirect_uri=redirect_uri)

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

        # Cache Google tokens in Redis for auto-refresh when access_token expires
        if google_refresh_token:
            await redis_cache_manager.set_cache(f"gdrive_refresh_token:{user.id}", google_refresh_token, ttl_seconds=30*86400)
        if google_access_token:
            await redis_cache_manager.set_cache(f"gdrive_access_token:{user.id}", google_access_token, ttl_seconds=3500)

        # 3. Issue Synapse Short-lived Access Token (15m) & Long-lived Refresh Token (30 days)
        from datetime import timedelta
        role_names = [r.name for r in user.roles]
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "roles": role_names,
            "google_token": google_access_token,
            "google_refresh_token": google_refresh_token,
        }
        access_token = create_access_token(data=token_data, expires_delta=timedelta(minutes=15))
        refresh_token = create_access_token(data={"sub": str(user.id), "type": "refresh"}, expires_delta=timedelta(days=30))

        # Store refresh token & session metadata in Redis for Rotation & Session Invalidation
        await redis_cache_manager.set_cache(f"user_refresh:{user.id}", refresh_token, ttl_seconds=30*86400)
        await redis_cache_manager.set_json_cache(f"user_session:{user.id}", {
            "user_id": str(user.id),
            "email": user.email,
            "roles": role_names,
            "active": True
        }, ttl_seconds=30*86400)

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
            expires_in=900,
            user=user_read
        )

    async def rotate_refresh_token(self, old_refresh_token: str) -> TokenResponse:
        """Rotates refresh token and issues fresh short-lived access token + new refresh token.
        Also proactively refreshes the Google Drive access token if it's missing or expired.
        """
        from shared.auth import decode_access_token
        from datetime import timedelta
        try:
            payload = decode_access_token(old_refresh_token)
            user_id = payload.get("sub")
            if not user_id or payload.get("type") != "refresh":
                raise BadRequestException("Invalid refresh token")
        except Exception:
            raise BadRequestException("Invalid or expired refresh token")

        # Verify stored refresh token in Redis
        cached_rf = await redis_cache_manager.get_cache(f"user_refresh:{user_id}")
        if not cached_rf or cached_rf != old_refresh_token:
            # Token reuse or invalidation detected - revoke session
            await redis_cache_manager.delete_cache(f"user_refresh:{user_id}")
            await redis_cache_manager.delete_cache(f"user_session:{user_id}")
            raise BadRequestException("Refresh token expired or revoked")

        # Fetch user
        uid = uuid.UUID(user_id)
        user = await self.user_repo.get_user_by_id(uid)
        if not user or not user.is_active:
            raise UnauthorizedException("User account disabled or not found")

        role_names = [r.name for r in user.roles]

        # Retrieve Google OAuth tokens from Redis cache
        g_access = await redis_cache_manager.get_cache(f"gdrive_access_token:{user.id}")
        g_refresh = await redis_cache_manager.get_cache(f"gdrive_refresh_token:{user.id}")

        # Proactively refresh Google access token if it's absent but refresh token exists
        # This ensures every rotated Synapse JWT carries a fresh, valid Google Drive token.
        if not g_access and g_refresh:
            try:
                refreshed = await self._refresh_google_token(g_refresh)
                if refreshed:
                    g_access = refreshed
                    await redis_cache_manager.set_cache(
                        f"gdrive_access_token:{user.id}", g_access, ttl_seconds=3500
                    )
                    logger.info(f"🔄 [PROACTIVE GOOGLE REFRESH] Refreshed Google access token for user {user.id} during session rotation")
            except Exception as exc:
                logger.warning(f"Proactive Google token refresh notice: {exc}")

        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "roles": role_names,
            "google_token": g_access,
            "google_refresh_token": g_refresh,
        }
        new_access_token = create_access_token(data=token_data, expires_delta=timedelta(minutes=15))
        new_refresh_token = create_access_token(data={"sub": str(user.id), "type": "refresh"}, expires_delta=timedelta(days=30))

        # Rotate token in Redis
        await redis_cache_manager.set_cache(f"user_refresh:{user.id}", new_refresh_token, ttl_seconds=30*86400)

        user_read = UserRead.model_validate(user)
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="Bearer",
            expires_in=900,
            user=user_read
        )

    async def _refresh_google_token(self, refresh_token: str) -> str | None:
        """Calls Google OAuth token endpoint to exchange refresh_token for a fresh access_token."""
        import httpx
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        if not client_id or not client_secret:
            return None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "refresh_token": refresh_token,
                        "grant_type": "refresh_token",
                    }
                )
                if res.status_code == 200:
                    return res.json().get("access_token")
                logger.warning(f"Google token refresh attempt returned {res.status_code}: {res.text[:100]}")
        except Exception as exc:
            logger.warning(f"Google token HTTP refresh notice: {exc}")
        return None

    async def refresh_google_token_for_user(self, user_id: str) -> str | None:
        """On-demand Google Drive access token refresh for a given user ID.
        Fetches the stored Google refresh token from Redis and exchanges it for a fresh access token.
        """
        g_refresh = await redis_cache_manager.get_cache(f"gdrive_refresh_token:{user_id}")
        if not g_refresh:
            logger.warning(f"No Google refresh token found in Redis for user {user_id}")
            return None
        fresh = await self._refresh_google_token(g_refresh)
        if fresh:
            await redis_cache_manager.set_cache(f"gdrive_access_token:{user_id}", fresh, ttl_seconds=3500)
            logger.info(f"🔄 [ON-DEMAND GOOGLE REFRESH] Refreshed Google access token for user {user_id}")
        return fresh

    async def logout_user(self, user_id: str):
        """Revokes user session and invalidates refresh token & profile caches in Redis."""
        await redis_cache_manager.delete_cache(f"user_refresh:{user_id}")
        await redis_cache_manager.delete_cache(f"user_session:{user_id}")
        await redis_cache_manager.delete_cache(CacheKeys.user_profile(user_id))
        logger.info(f"Revoked authentication session for user '{user_id}'")

    async def get_current_user_profile(self, user_id_str: str) -> UserRead:
        """Returns UserRead profile for current authenticated user ID, leveraging Redis caching."""
        try:
            cached_data = await redis_cache_manager.get_json_cache(CacheKeys.user_profile(user_id_str))
            if cached_data:
                logger.info(f"⚡ [REDIS PROFILE CACHE HIT] Bypassed SQL query for user ID '{user_id_str[:8]}'")
                return UserRead.model_validate(cached_data)
        except Exception as exc:
            logger.warning(f"Redis profile cache lookup notice: {exc}")

        try:
            uid = uuid.UUID(user_id_str)
            user = await self.user_repo.get_user_by_id(uid)
        except Exception:
            user = None

        if not user:
            raise NotFoundException("User profile not found")

        user_read = UserRead.model_validate(user)

        try:
            await redis_cache_manager.set_json_cache(CacheKeys.user_profile(user_id_str), user_read.model_dump(mode="json"), ttl_seconds=900)
        except Exception as exc:
            logger.warning(f"Redis profile cache save notice: {exc}")

        return UserRead.model_validate(user)
