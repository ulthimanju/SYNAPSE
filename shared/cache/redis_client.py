import json
import hashlib
import logging
from typing import Optional, List
import redis.asyncio as aioredis
from shared.config.settings import settings

logger = logging.getLogger(__name__)

class RedisCacheManager:
    """Async Redis Manager for query embedding caching and response acceleration."""
    
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

    async def get_embedding_cache(self, text: str, model_name: str) -> Optional[List[float]]:
        """Retrieves cached 768-dim query embedding vector from Redis if exists."""
        try:
            key_hash = hashlib.sha256(f"{model_name}:{text.strip().lower()}".encode("utf-8")).hexdigest()
            cache_key = f"vector_cache:{key_hash}"
            client = await self.get_client()
            cached_json = await client.get(cache_key)
            if cached_json:
                vec = json.loads(cached_json)
                if isinstance(vec, list) and len(vec) == 768:
                    logger.info(f"⚡ [REDIS VECTOR CACHE HIT] Bypassed Gemini API call for query: '{text[:30]}...'")
                    return vec
        except Exception as exc:
            logger.warning(f"Redis vector cache lookup notice: {exc}")
        return None

    async def set_embedding_cache(self, text: str, model_name: str, embedding: List[float], ttl_seconds: int = 604800):
        """Caches 768-dim query embedding vector in Redis (default TTL: 7 days)."""
        if not embedding or len(embedding) != 768:
            return
        try:
            key_hash = hashlib.sha256(f"{model_name}:{text.strip().lower()}".encode("utf-8")).hexdigest()
            cache_key = f"vector_cache:{key_hash}"
            client = await self.get_client()
            await client.set(cache_key, json.dumps(embedding), ex=ttl_seconds)
            logger.info(f"💾 [REDIS VECTOR CACHED] Saved 768-dim vector in Redis (TTL: 7 days) for query: '{text[:30]}...'")
        except Exception as exc:
            logger.warning(f"Redis vector cache save notice: {exc}")

redis_cache_manager = RedisCacheManager()
