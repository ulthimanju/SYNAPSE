import json
import re
import logging
from typing import Optional
from shared.exceptions import ServiceUnavailableException
from ..clients.rag_client import RAGServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.unit_content import UNIT_CONTENT_SYSTEM_PROMPT, build_unit_content_prompt
from ..schemas.unit_content import UnitContentRequest, UnitContentResponse, UnitFlashcard, UnitQuiz, UnitQuizQuestion

from shared.cache.redis_client import redis_cache_manager, CacheKeys

logger = logging.getLogger(__name__)

class UnitContentService:
    """Service handling RAG-grounded Summary + Flashcards + Quiz generation for a target Learning Unit."""

    def __init__(
        self,
        rag_client: Optional[RAGServiceClient] = None,
        ai_provider=None
    ):
        self.rag_client = rag_client or RAGServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_unit_content(self, req: UnitContentRequest) -> UnitContentResponse:
        """Pipeline: Learning Unit -> RAG Query (using Unit Title) -> Retrieve Relevant Grounding Context -> LLM -> Generate Summary, Quiz, & Flashcards."""
        import hashlib
        from shared.cache.redis_client import redis_cache_manager

        # 1. Construct RAG search query using Unit Title + Topics
        rag_query = f"{req.unit_title} {' '.join(req.topics)}"
        
        # 2. Retrieve relevant grounding context chunks from Redis Cache or RAG Service (pgvector)
        query_hash = hashlib.sha256(rag_query.encode("utf-8")).hexdigest()[:16]
        cache_key = CacheKeys.rag_chunks(req.workspace_id, query_hash)

        cached_chunks = await redis_cache_manager.get_json_cache(cache_key)
        if cached_chunks is not None and isinstance(cached_chunks, list):
            rag_chunks = cached_chunks
            logger.info(f"⚡ [REDIS RAG CHUNK HIT] Bypassed pgvector search for query hash '{query_hash}'")
        else:
            rag_chunks = await self.rag_client.retrieve_grounding_context(
                workspace_id=req.workspace_id,
                query=rag_query,
                top_k=5
            )
            await redis_cache_manager.set_json_cache(cache_key, rag_chunks, ttl_seconds=3600)

        # 3. Format prompt with RAG grounding context as primary source of truth
        prompt = build_unit_content_prompt(
            unit_title=req.unit_title,
            topics=req.topics,
            learning_objectives=req.learning_objectives,
            rag_chunks=rag_chunks,
            position=getattr(req, "position", None)
        )

        # 4. Generate structured content via LLM (Gemini 3.6 Flash with 2.5 Flash fallback)
        try:
            raw_json_str = await self.ai_provider.generate_structured(
                prompt=prompt,
                schema=None,
                system_instruction=UNIT_CONTENT_SYSTEM_PROMPT
            )

            if raw_json_str and raw_json_str != "{}":
                cleaned_str = raw_json_str.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                data = None
                try:
                    data = json.loads(cleaned_str)
                except Exception:
                    try:
                        decoder = json.JSONDecoder(strict=False)
                        data, _ = decoder.raw_decode(cleaned_str)
                    except Exception:
                        match = re.search(r"(\{.*\})", cleaned_str, re.DOTALL)
                        if match:
                            try:
                                data = json.loads(match.group(1))
                            except Exception:
                                pass

                if isinstance(data, dict):
                    raw_fc = data.get("flashcards", [])
                    flashcards = [
                        UnitFlashcard(
                            question=c.get("question", f"What is the key principle of {req.unit_title}?"),
                            answer=c.get("answer", "Core foundational domain logic."),
                            difficulty=c.get("difficulty", "Medium"),
                            tags=c.get("tags", req.topics[:2])
                        )
                        for c in raw_fc
                    ]

                    raw_q = data.get("quiz", {}).get("questions", [])
                    quiz_questions = [
                        UnitQuizQuestion(
                            id=q.get("id", f"q{idx+1}"),
                            type=q.get("type", "multiple_choice"),
                            question=q.get("question", f"Which concept applies to {req.unit_title}?"),
                            options=q.get("options", ["Option A", "Option B", "Option C", "Option D"]),
                            correct_answer=q.get("correct_answer", "Option A"),
                            explanation=q.get("explanation", "Detailed explanatory rationale."),
                            difficulty=q.get("difficulty", "Medium")
                        )
                        for idx, q in enumerate(raw_q)
                    ]

                    return UnitContentResponse(
                        workspace_id=req.workspace_id,
                        unit_id=req.unit_id,
                        unit_title=req.unit_title,
                        unit_summary=data.get("unit_summary", f"# {req.unit_title}\n\nDetailed breakdown of {', '.join(req.topics)}."),
                        flashcards=flashcards,
                        quiz=UnitQuiz(
                            title=data.get("quiz", {}).get("title", f"{req.unit_title} Assessment Quiz"),
                            questions=quiz_questions
                        )
                    )
        except Exception as exc:
            logger.error(f"Gemini RAG unit content generation error: {exc}")
            raise ServiceUnavailableException(f"Failed to generate RAG unit content: {exc}")

        raise ServiceUnavailableException("AI Provider returned empty structured payload for unit content.")
