import json
import hashlib
import logging
from typing import Optional, List, Any
import redis.asyncio as aioredis
from shared.config.settings import settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Cache Key Builders — Centralised so every key is consistent across services
# ─────────────────────────────────────────────────────────────────────────────
class CacheKeys:
    """Centralised factory for every Redis key used across the Synapse stack.

    All keys that relate to a specific user MUST include the user_id segment
    so that different users in the same workspace never receive each other's
    cached data and so that per-user invalidation is trivially targeted.
    """

    # identity-service
    @staticmethod
    def user_profile(user_id: str) -> str:
        return f"user_profile:{user_id}"

    # workspace-service
    @staticmethod
    def user_workspaces(user_id: str) -> str:
        return f"user_workspaces:{user_id}"

    @staticmethod
    def ws_detail(workspace_id: str, user_id: str) -> str:
        return f"ws_detail:{workspace_id}:{user_id}"

    # Learning Path — shared workspace content, but scoped with ws_id.
    # Per-user isolation is enforced at the API membership-check layer.
    @staticmethod
    def lp_cache(workspace_id: str) -> str:
        return f"lp_cache:{workspace_id}"

    # Unit Content — same content for all workspace members.
    @staticmethod
    def unit_content(workspace_id: str, unit_id: str) -> str:
        return f"unit_content:{workspace_id}:{unit_id}"

    # RAG Chat Session — per-user per-workspace conversation history
    @staticmethod
    def chat_session(workspace_id: str, user_id: str) -> str:
        return f"chat_session:{workspace_id}:{user_id}"

    # RAG chunk retrieval cache — shared workspace content
    @staticmethod
    def rag_chunks(workspace_id: str, query_hash: str) -> str:
        return f"rag_chunks:{workspace_id}:{query_hash}"

    # Embedding vector cache — content-addressed, immutable
    @staticmethod
    def vector_cache(model_name: str, text: str) -> str:
        key_hash = hashlib.sha256(
            f"{model_name}:{text.strip().lower()}".encode("utf-8")
        ).hexdigest()
        return f"vector_cache:{key_hash}"

    # Wildcard patterns for bulk deletion
    @staticmethod
    def ws_detail_pattern(workspace_id: str) -> str:
        """Matches ws_detail:<workspace_id>:* — all users' detail caches for a workspace."""
        return f"ws_detail:{workspace_id}:*"

    @staticmethod
    def chat_session_pattern(workspace_id: str) -> str:
        """Matches chat_session:<workspace_id>:* — all users' chat sessions for a workspace."""
        return f"chat_session:{workspace_id}:*"

    @staticmethod
    def unit_content_pattern(workspace_id: str) -> str:
        """Matches unit_content:<workspace_id>:* — all unit caches for a workspace."""
        return f"unit_content:{workspace_id}:*"


# ─────────────────────────────────────────────────────────────────────────────
# RedisCacheManager
# ─────────────────────────────────────────────────────────────────────────────
class RedisCacheManager:
    """Async Redis Manager with centralised key management and pattern-based invalidation."""

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.redis.url
        self._redis: Optional[aioredis.Redis] = None

    async def get_client(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
        return self._redis

    # ── Embedding Vector Cache ────────────────────────────────────────────────

    async def get_embedding_cache(self, text: str, model_name: str) -> Optional[List[float]]:
        """Retrieves cached 768-dim query embedding vector from Redis if exists."""
        try:
            key = CacheKeys.vector_cache(model_name, text)
            client = await self.get_client()
            cached_json = await client.get(key)
            if cached_json:
                vec = json.loads(cached_json)
                if isinstance(vec, list) and len(vec) == 768:
                    logger.info(f"⚡ [REDIS VECTOR CACHE HIT] Bypassed Gemini embedding for: '{text[:30]}...'")
                    return vec
        except Exception as exc:
            logger.warning(f"Redis vector cache lookup notice: {exc}")
        return None

    async def set_embedding_cache(
        self, text: str, model_name: str, embedding: List[float], ttl_seconds: int = 604800
    ):
        """Caches 768-dim query embedding vector in Redis (default TTL: 7 days)."""
        if not embedding or len(embedding) != 768:
            return
        try:
            key = CacheKeys.vector_cache(model_name, text)
            client = await self.get_client()
            await client.set(key, json.dumps(embedding), ex=ttl_seconds)
            logger.info(f"💾 [REDIS VECTOR CACHED] 768-dim vector stored (TTL: 7d) for: '{text[:30]}...'")
        except Exception as exc:
            logger.warning(f"Redis vector cache save notice: {exc}")

    # ── Generic JSON Cache ────────────────────────────────────────────────────

    async def get_json_cache(self, key: str) -> Optional[Any]:
        """Retrieves deserialized JSON object from Redis."""
        try:
            client = await self.get_client()
            cached = await client.get(key)
            if cached:
                return json.loads(cached)
        except Exception as exc:
            logger.warning(f"Redis JSON cache lookup notice for key '{key}': {exc}")
        return None

    async def set_json_cache(self, key: str, value: Any, ttl_seconds: int = 3600):
        """Serializes and caches value in Redis with specified TTL."""
        try:
            client = await self.get_client()
            await client.set(key, json.dumps(value), ex=ttl_seconds)
        except Exception as exc:
            logger.warning(f"Redis JSON cache save notice for key '{key}': {exc}")

    # ── Single-Key Deletion ───────────────────────────────────────────────────

    async def delete_cache(self, key: str):
        """Deletes a single cache key from Redis."""
        try:
            client = await self.get_client()
            await client.delete(key)
            logger.info(f"🧹 [REDIS DELETED] Key: '{key}'")
        except Exception as exc:
            logger.warning(f"Redis cache delete notice for key '{key}': {exc}")

    # ── Pattern-Based (Wildcard) Bulk Deletion ───────────────────────────────

    async def delete_pattern(self, pattern: str) -> int:
        """Deletes ALL Redis keys matching a glob-style pattern using non-blocking SCAN.

        Example patterns:
          - ``ws_detail:<workspace_id>:*``  → clears all members' detail caches
          - ``chat_session:<ws_id>:*``      → clears all users' chat sessions
          - ``unit_content:<ws_id>:*``      → clears all unit caches for a workspace
        """
        deleted = 0
        try:
            client = await self.get_client()
            cursor = 0
            while True:
                cursor, keys = await client.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    await client.delete(*keys)
                    deleted += len(keys)
                if cursor == 0:
                    break
            if deleted:
                logger.info(f"🧹 [REDIS PATTERN DELETE] Removed {deleted} keys matching '{pattern}'")
        except Exception as exc:
            logger.warning(f"Redis pattern delete notice for pattern '{pattern}': {exc}")
        return deleted


redis_cache_manager = RedisCacheManager()
