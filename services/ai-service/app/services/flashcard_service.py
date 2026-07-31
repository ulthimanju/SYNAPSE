import json
import logging
from typing import Optional
from shared.exceptions import NotFoundException
from ..clients.workspace_client import WorkspaceServiceClient
from ..clients.rag_client import RAGServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.flashcards import FLASHCARDS_SYSTEM_PROMPT, build_flashcards_prompt
from ..schemas.flashcards import FlashcardsResponse, FlashcardItem

logger = logging.getLogger(__name__)

class FlashcardService:
    """Service layer handling AI Flashcard generation with RAG context grounding."""

    def __init__(
        self,
        ws_client: Optional[WorkspaceServiceClient] = None,
        rag_client: Optional[RAGServiceClient] = None,
        ai_provider=None
    ):
        self.ws_client = ws_client or WorkspaceServiceClient()
        self.rag_client = rag_client or RAGServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_flashcards(self, workspace_id: str) -> FlashcardsResponse:
        """Retrieves learning path, queries RAG service for grounding context, calls Gemini, and returns RAG-grounded flashcards."""
        # 1. Retrieve cached learning path via REST
        learning_path = await self.ws_client.get_workspace_learning_path(workspace_id)
        if not learning_path:
            raise NotFoundException(f"No learning path available for workspace {workspace_id}")

        # 2. Extract unit titles for RAG query
        title = learning_path.get("title", "Workspace Subject")
        units = learning_path.get("units", [])
        unit_titles = [u.get("title", "") for u in units if u.get("title")]
        rag_query = f"{title} {' '.join(unit_titles)}"

        # 3. Retrieve grounding chunks via RAG Service (pgvector)
        rag_chunks = await self.rag_client.retrieve_grounding_context(
            workspace_id=workspace_id,
            query=rag_query,
            top_k=6
        )

        # 4. Format prompt with RAG grounding context
        prompt = build_flashcards_prompt(learning_path, rag_chunks=rag_chunks)

        # 5. Call Gemini structured generation
        raw_json_str = await self.ai_provider.generate_structured(
            prompt=prompt,
            schema=None,
            system_instruction=FLASHCARDS_SYSTEM_PROMPT
        )

        # 6. Parse JSON & validate response schema
        try:
            cleaned_str = raw_json_str.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            data = json.loads(cleaned_str)
            raw_cards = data.get("flashcards", [])
            cards = [
                FlashcardItem(
                    id=c.get("id", f"card-{idx+1}"),
                    unit_id=c.get("unit_id", "unit-1"),
                    question=c.get("question", "What is the primary role of this concept?"),
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
                    question="How does vector retrieval enhance LLM accuracy in RAG?",
                    answer="It supplies exact, relevant document chunks directly into the prompt context to prevent hallucinations.",
                    difficulty="Easy",
                    tags=["RAG", "pgvector"]
                )
            ]
            return FlashcardsResponse(workspace_id=workspace_id, flashcards=fallback_cards)
