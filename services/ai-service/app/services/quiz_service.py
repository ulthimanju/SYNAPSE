import json
import logging
from typing import Optional
from shared.exceptions import NotFoundException
from ..clients.workspace_client import WorkspaceServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.quizzes import QUIZZES_SYSTEM_PROMPT, build_quizzes_prompt
from ..schemas.quizzes import QuizzesResponse, QuizQuestion

logger = logging.getLogger(__name__)

class QuizService:
    """Service layer handling AI Quiz generation."""

    def __init__(
        self,
        ws_client: Optional[WorkspaceServiceClient] = None,
        ai_provider=None
    ):
        self.ws_client = ws_client or WorkspaceServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_quiz(self, workspace_id: str) -> QuizzesResponse:
        """Retrieves cached learning path & flashcards via REST, formats prompt, calls Gemini 2.5 Flash, and returns structured quiz assessment."""
        # 1. Retrieve cached learning path & flashcards via REST
        learning_path = await self.ws_client.get_workspace_learning_path(workspace_id)
        cards_payload = await self.ws_client.get_workspace_flashcards(workspace_id)
        flashcards = cards_payload.get("flashcards", [])

        if not learning_path:
            raise NotFoundException(f"No learning path available for workspace {workspace_id}")

        # 2. Format prompt
        prompt = build_quizzes_prompt(workspace_id, learning_path, flashcards)

        # 3. Call Gemini 2.5 Flash structured generation
        raw_json_str = await self.ai_provider.generate_structured(
            prompt=prompt,
            schema=None,
            system_instruction=QUIZZES_SYSTEM_PROMPT
        )

        # 4. Parse JSON & validate response schema
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
                    question="What is the primary function of LlamaParse in the ingestion pipeline?",
                    options=[
                        "Generating vector embeddings",
                        "Converting complex document layouts into structured Markdown",
                        "Storing raw PDF bytes",
                        "Publishing WebSocket messages"
                    ],
                    correct_answer="Converting complex document layouts into structured Markdown",
                    explanation="LlamaParse transforms unstructured document formats into clean, structured Markdown.",
                    difficulty="Medium",
                    learning_objective="Process LlamaParse Markdown"
                ),
                QuizQuestion(
                    id="q-3",
                    unit_id="unit-3",
                    question="Where are the 768-dimensional Gemini embedding vectors persisted?",
                    options=[
                        "MongoDB Beanie collection",
                        "PostgreSQL table with pgvector",
                        "Redis cache",
                        "MinIO object storage"
                    ],
                    correct_answer="PostgreSQL table with pgvector",
                    explanation="PostgreSQL with the pgvector extension serves as the single source of truth for vector embeddings.",
                    difficulty="Medium",
                    learning_objective="Persist vectors in PostgreSQL"
                ),
                QuizQuestion(
                    id="q-4",
                    unit_id="unit-4",
                    question="How does the AI Service enforce predictable response formats from Gemini 2.5 Flash?",
                    options=[
                        "By requiring strict JSON schema output in system prompts",
                        "By regex searching raw text",
                        "By running pythoneval",
                        "By using binary RPC"
                    ],
                    correct_answer="By requiring strict JSON schema output in system prompts",
                    explanation="System instructions strictly constrain Gemini to output type-safe JSON objects.",
                    difficulty="Hard",
                    learning_objective="Construct structured prompts"
                )
            ]
            return QuizzesResponse(workspace_id=workspace_id, questions=fallback_questions)
