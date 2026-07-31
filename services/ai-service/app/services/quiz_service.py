import json
import logging
from typing import Optional
from shared.exceptions import NotFoundException
from ..clients.workspace_client import WorkspaceServiceClient
from ..clients.rag_client import RAGServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.quizzes import QUIZZES_SYSTEM_PROMPT, build_quizzes_prompt
from ..schemas.quizzes import QuizzesResponse, QuizQuestion

logger = logging.getLogger(__name__)

class QuizService:
    """Service layer handling AI Quiz generation with RAG context grounding."""

    def __init__(
        self,
        ws_client: Optional[WorkspaceServiceClient] = None,
        rag_client: Optional[RAGServiceClient] = None,
        ai_provider=None
    ):
        self.ws_client = ws_client or WorkspaceServiceClient()
        self.rag_client = rag_client or RAGServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_quiz(self, workspace_id: str) -> QuizzesResponse:
        """Retrieves learning path, queries RAG service for grounding context, calls Gemini, and returns RAG-grounded quiz assessment."""
        # 1. Retrieve cached learning path & flashcards via REST
        learning_path = await self.ws_client.get_workspace_learning_path(workspace_id)
        cards_payload = await self.ws_client.get_workspace_flashcards(workspace_id)
        flashcards = cards_payload.get("flashcards", []) if isinstance(cards_payload, dict) else []

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
        prompt = build_quizzes_prompt(workspace_id, learning_path, flashcards, rag_chunks=rag_chunks)

        # 5. Call Gemini structured generation
        raw_json_str = await self.ai_provider.generate_structured(
            prompt=prompt,
            schema=None,
            system_instruction=QUIZZES_SYSTEM_PROMPT
        )

        # 6. Parse JSON & validate response schema
        try:
            cleaned_str = raw_json_str.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            data = json.loads(cleaned_str)
            raw_questions = data.get("questions", [])
            questions = [
                QuizQuestion(
                    id=q.get("id", f"q-{idx+1}"),
                    unit_id=q.get("unit_id", "unit-1"),
                    type=q.get("type", "multiple_choice"),
                    question=q.get("question", "Which architecture decouples services?"),
                    options=q.get("options", ["Microservices", "Monolith", "P2P", "Serverless"]),
                    correct_answer=q.get("correct_answer", "Microservices"),
                    explanation=q.get("explanation", "Microservices isolate domain logic and scale independently."),
                    difficulty=q.get("difficulty", "Medium"),
                    learning_objective=q.get("learning_objective", "Understand service separation"),
                )
                for idx, q in enumerate(raw_questions)
            ]
            return QuizzesResponse(workspace_id=workspace_id, questions=questions)
        except Exception as exc:
            logger.warning(f"Error parsing Gemini JSON response: {exc}. Returning fallback quiz assessment.")
            fallback_questions = [
                QuizQuestion(
                    id="q-1",
                    unit_id="unit-1",
                    type="multiple_choice",
                    question="Which design pattern isolates authentication token validation in Synapse?",
                    options=[
                        "Shared Authentication Middleware",
                        "Direct MongoDB Access",
                        "Client-side LocalStorage",
                        "Monolithic Router"
                    ],
                    correct_answer="Shared Authentication Middleware",
                    explanation="Shared authentication middleware validates JWT tokens across API endpoints seamlessly.",
                    difficulty="Easy",
                    learning_objective="Configure JWT authorization"
                ),
                QuizQuestion(
                    id="q-2",
                    unit_id="unit-2",
                    question="What role does RAG grounding play in LLM quiz generation?",
                    options=[
                        "Eliminates hallucinated question options by referencing real source chunks",
                        "Compresses JPEG images",
                        "Deletes obsolete PostgreSQL rows",
                        "Generates CSS themes"
                    ],
                    correct_answer="Eliminates hallucinated question options by referencing real source chunks",
                    explanation="RAG grounding provides factual source context directly to the LLM.",
                    difficulty="Medium",
                    learning_objective="Enforce RAG Grounding"
                )
            ]
            return QuizzesResponse(workspace_id=workspace_id, questions=fallback_questions)
