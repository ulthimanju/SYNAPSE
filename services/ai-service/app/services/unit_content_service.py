import json
import re
import logging
from typing import Optional
from shared.exceptions import NotFoundException, ServiceUnavailableException
from ..clients.document_client import DocumentServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.unit_content import UNIT_CONTENT_SYSTEM_PROMPT, build_unit_content_prompt
from ..schemas.unit_content import UnitContentRequest, UnitContentResponse, UnitFlashcard, UnitQuiz, UnitQuizQuestion

logger = logging.getLogger(__name__)

class UnitContentService:
    """Service handling concept-specific Summary + Flashcards + Quiz generation for a target Learning Unit."""

    def __init__(
        self,
        doc_client: Optional[DocumentServiceClient] = None,
        ai_provider=None
    ):
        self.doc_client = doc_client or DocumentServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_unit_content(self, req: UnitContentRequest) -> UnitContentResponse:
        """Retrieves workspace documents, formats unit prompt, calls Gemini Direct Engine, and returns structured unit content."""
        documents = await self.doc_client.get_parsed_documents(req.workspace_id)
        if not documents:
            documents = [{"title": "Workspace Context", "markdown": f"# {req.unit_title}\n\nTopics: {', '.join(req.topics)}"}]

        prompt = build_unit_content_prompt(
            unit_title=req.unit_title,
            topics=req.topics,
            learning_objectives=req.learning_objectives,
            documents=documents
        )

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
            logger.error(f"Gemini unit content generation error: {exc}")
            raise ServiceUnavailableException(f"Failed to generate AI unit content: {exc}")

        raise ServiceUnavailableException("AI Provider returned empty structured payload for unit content.")
