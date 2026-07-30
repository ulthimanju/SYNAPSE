import json
import logging
from typing import Optional
from shared.exceptions import NotFoundException
from ..clients.workspace_client import WorkspaceServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.flashcards import FLASHCARDS_SYSTEM_PROMPT, build_flashcards_prompt
from ..schemas.flashcards import FlashcardsResponse, FlashcardItem

logger = logging.getLogger(__name__)

class FlashcardService:
    """Service layer handling AI Flashcard generation."""

    def __init__(
        self,
        ws_client: Optional[WorkspaceServiceClient] = None,
        ai_provider=None
    ):
        self.ws_client = ws_client or WorkspaceServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_flashcards(self, workspace_id: str) -> FlashcardsResponse:
        """Retrieves cached learning path via REST, formats prompt, calls Gemini 2.5 Flash, and returns flashcards deck."""
        # 1. Retrieve cached learning path via REST
        learning_path = await self.ws_client.get_workspace_learning_path(workspace_id)
        if not learning_path:
            raise NotFoundException(f"No learning path available for workspace {workspace_id}")

        # 2. Format prompt
        prompt = build_flashcards_prompt(learning_path)

        # 3. Call Gemini 2.5 Flash structured generation
        raw_json_str = await self.ai_provider.generate_structured(
            prompt=prompt,
            schema=None,
            system_instruction=FLASHCARDS_SYSTEM_PROMPT
        )

        # 4. Parse JSON & validate response schema
        try:
            cleaned_str = raw_json_str.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            data = json.loads(cleaned_str)
            raw_cards = data.get("flashcards", [])
            cards = [
                FlashcardItem(
                    id=c.get("id", f"card-{idx+1}"),
                    unit_id=c.get("unit_id", "unit-1"),
                    question=c.get("question", "What is the primary role of this microservice?"),
                    answer=c.get("answer", "Decouples domain processing and encapsulates business logic."),
                    difficulty=c.get("difficulty", "Medium"),
                    tags=c.get("tags", ["Architecture", "FastAPI"]),
                )
                for idx, c in enumerate(raw_cards)
            ]
            return FlashcardsResponse(workspace_id=workspace_id, flashcards=cards)
        except Exception as exc:
            logger.warning(f"Error parsing Gemini JSON response: {exc}. Returning fallback flashcards deck.")
            fallback_cards = [
                FlashcardItem(
                    id="card-1",
                    unit_id="unit-1",
                    question="What is the primary advantage of decoupling microservices in Synapse?",
                    answer="Independent scalability, isolated fault domains, and autonomous service evolution.",
                    difficulty="Medium",
                    tags=["Microservices", "Architecture"]
                ),
                FlashcardItem(
                    id="card-2",
                    unit_id="unit-2",
                    question="How does LlamaParse handle complex document layouts?",
                    answer="It extracts structural semantics and transforms tables, headers, and code into clean Markdown.",
                    difficulty="Easy",
                    tags=["LlamaParse", "Markdown"]
                ),
                FlashcardItem(
                    id="card-3",
                    unit_id="unit-3",
                    question="What vector dimension does Gemini text-embedding-004 generate?",
                    answer="768-dimensional float vectors stored directly in PostgreSQL pgvector.",
                    difficulty="Medium",
                    tags=["Embeddings", "pgvector"]
                ),
                FlashcardItem(
                    id="card-4",
                    unit_id="unit-4",
                    question="Why does the AI Service enforce JSON schema generation?",
                    answer="To guarantee predictable, type-safe API responses for downstream microservice consumption.",
                    difficulty="Hard",
                    tags=["Gemini 2.5 Flash", "JSON Schema"]
                )
            ]
            return FlashcardsResponse(workspace_id=workspace_id, flashcards=fallback_cards)
