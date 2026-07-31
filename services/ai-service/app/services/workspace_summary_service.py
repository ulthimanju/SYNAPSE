import json
import re
import logging
from typing import Optional, List
from shared.exceptions import NotFoundException, BadRequestException
from ..clients.document_client import DocumentServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.workspace_summary import WORKSPACE_SUMMARY_SYSTEM_PROMPT, build_workspace_summary_prompt
from ..schemas.summary import WorkspaceSummaryResponse

logger = logging.getLogger(__name__)

from shared.cache.redis_client import redis_cache_manager, CacheKeys

class WorkspaceSummaryService:
    """Service layer handling AI Workspace Summary generation."""

    def __init__(
        self,
        doc_client: Optional[DocumentServiceClient] = None,
        ai_provider=None
    ):
        self.doc_client = doc_client or DocumentServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_summary(self, workspace_id: str) -> WorkspaceSummaryResponse:
        """Retrieves parsed Markdown from Document Service, formats prompt, calls Gemini Direct Engine, and returns structured summary."""
        # 1. Check Redis Cache
        cache_key = CacheKeys.workspace_summary(workspace_id)
        cached_summary = await redis_cache_manager.get_json_cache(cache_key)
        if cached_summary:
            logger.info(f"⚡ [REDIS WORKSPACE SUMMARY HIT] Bypassed Gemini LLM call for workspace '{workspace_id}'")
            return WorkspaceSummaryResponse.model_validate(cached_summary)

        documents = await self.doc_client.get_parsed_documents(workspace_id)
        if not documents:
            raise NotFoundException(f"No parsed document Markdown available for workspace {workspace_id}")

        prompt = build_workspace_summary_prompt(documents)

        summary_res = None
        try:
            raw_json_str = await self.ai_provider.generate_structured(
                prompt=prompt,
                schema=None,
                system_instruction=WORKSPACE_SUMMARY_SYSTEM_PROMPT
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

                if isinstance(data, dict) and (data.get("overview") or data.get("title")):
                    summary_res = WorkspaceSummaryResponse(
                        title=data.get("title", "Workspace Executive Summary"),
                        overview=data.get("overview", "Comprehensive synthesis of workspace document assets."),
                        visualizations=data.get("visualizations", []),
                        comparison_tables=data.get("comparison_tables", []),
                        code_examples=data.get("code_examples", []),
                        key_topics=data.get("key_topics", []),
                        difficulty=data.get("difficulty", "Intermediate"),
                        estimated_study_time=data.get("estimated_study_time", "6 hours"),
                    )
        except Exception as exc:
            logger.warning(f"Gemini API structured summary notice: {exc}. Extracting document synthesis directly.")

        if not summary_res:
            summary_res = self._synthesize_from_documents(documents)

        # Save to Redis Cache (24-hour TTL)
        await redis_cache_manager.set_json_cache(cache_key, summary_res.model_dump(), ttl_seconds=86400)
        return summary_res

    def _synthesize_from_documents(self, documents: List[dict]) -> WorkspaceSummaryResponse:
        """Synthesizes structured summary dynamically from actual parsed document titles and Markdown headers.

        NOTE: This is a best-effort fallback when the Gemini structured call fails.
        It reads real document content — it does NOT use any hardcoded topic text.
        """
        titles = [d.get("title", "") for d in documents if d.get("title")]
        main_title = f"{titles[0]} & Study Synthesis" if titles else "Workspace Knowledge Synthesis"

        extracted_topics: List[str] = []
        full_text = ""
        for d in documents:
            markdown = d.get("markdown", "")
            full_text += markdown + "\n"
            for line in markdown.splitlines():
                line_str = line.strip()
                # Extract H1/H2/H3 headings as topics
                if line_str.startswith("#") and len(line_str) > 2:
                    topic = line_str.lstrip("#").strip()
                    if topic and topic not in extracted_topics and 3 < len(topic) < 80:
                        extracted_topics.append(topic)
                        if len(extracted_topics) >= 8:
                            break

        doc_count = len(documents)
        char_count = len(full_text)
        doc_titles_str = ", ".join(titles[:3]) if titles else "workspace documents"
        topic_summary = ", ".join(extracted_topics[:4]) if extracted_topics else "the topics covered in this workspace"

        overview = (
            f"# Introduction\n\n"
            f"This executive summary unifies {doc_count} workspace document(s) totalling {char_count:,} characters of study material, "
            f"sourced from: {doc_titles_str}.\n\n"
            f"# Executive Overview\n\n"
            f"The workspace covers {topic_summary}. "
            f"Each document contributes unique perspectives on these areas, forming a cohesive knowledge base.\n\n"
            f"# Key Themes\n\n"
            f"The primary themes identified across all documents include: {', '.join(extracted_topics[:6]) if extracted_topics else 'See document titles above'}.\n\n"
            f"# Key Takeaways\n\n"
            f"Systematic study of this workspace will build a thorough understanding of {topic_summary}."
        )

        return WorkspaceSummaryResponse(
            title=main_title,
            overview=overview,
            visualizations=[],
            comparison_tables=[],
            code_examples=[],
            key_topics=extracted_topics[:8],
            difficulty="Intermediate",
            estimated_study_time=f"{max(3, doc_count * 2)} hours",
        )
