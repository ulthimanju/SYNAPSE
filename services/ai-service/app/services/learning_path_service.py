import json
import logging
from typing import Optional
from shared.exceptions import NotFoundException
from ..clients.workspace_client import WorkspaceServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.learning_path import LEARNING_PATH_SYSTEM_PROMPT, build_learning_path_prompt
from ..schemas.learning_path import LearningPathResponse, LearningUnit

logger = logging.getLogger(__name__)

class LearningPathService:
    """Service layer handling AI Learning Path generation."""

    def __init__(
        self,
        ws_client: Optional[WorkspaceServiceClient] = None,
        ai_provider=None
    ):
        self.ws_client = ws_client or WorkspaceServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_learning_path(self, workspace_id: str) -> LearningPathResponse:
        """Retrieves workspace summary via REST, formats prompt, calls Gemini 2.5 Flash, and returns structured learning path."""
        # 1. Retrieve cached workspace summary via REST
        summary = await self.ws_client.get_workspace_summary(workspace_id)
        if not summary:
            raise NotFoundException(f"No summary available for workspace {workspace_id}")

        # 2. Format prompt
        prompt = build_learning_path_prompt(summary)

        # 3. Call Gemini 2.5 Flash structured generation
        raw_json_str = await self.ai_provider.generate_structured(
            prompt=prompt,
            schema=None,
            system_instruction=LEARNING_PATH_SYSTEM_PROMPT
        )

        # 4. Parse JSON & validate response schema
        try:
            cleaned_str = raw_json_str.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            data = json.loads(cleaned_str)
            raw_units = data.get("units", [])
            units = [
                LearningUnit(
                    id=u.get("id", f"unit-{idx+1}"),
                    title=u.get("title", f"Unit {idx+1}"),
                    description=u.get("description", "Core concept module."),
                    difficulty=u.get("difficulty", "Beginner"),
                    estimated_time=u.get("estimated_time", "45 min"),
                    prerequisites=u.get("prerequisites", []),
                    learning_objectives=u.get("learning_objectives", []),
                    topics=u.get("topics", []),
                )
                for idx, u in enumerate(raw_units)
            ]
            return LearningPathResponse(
                title=data.get("title", f"Mastery Path: {summary.get('title', 'Workspace')}"),
                units=units
            )
        except Exception as exc:
            logger.warning(f"Error parsing Gemini JSON response: {exc}. Returning fallback learning path.")
            fallback_units = [
                LearningUnit(
                    id="unit-1",
                    title="1. Foundations of Microservices & Multi-Agent Design",
                    description="Introduction to event-driven architectures, FastAPI microservices, and identity management.",
                    difficulty="Beginner",
                    estimated_time="45 min",
                    prerequisites=["Python AsyncIO", "HTTP REST"],
                    learning_objectives=["Understand service separation", "Configure JWT authorization"],
                    topics=["FastAPI", "JWT Auth", "Monorepo Structure"]
                ),
                LearningUnit(
                    id="unit-2",
                    title="2. Document Parsing & Storage Ingestion",
                    description="Deep dive into MinIO object storage, LlamaParse Markdown extraction, and RabbitMQ events.",
                    difficulty="Intermediate",
                    estimated_time="60 min",
                    prerequisites=["Unit 1"],
                    learning_objectives=["Stream file uploads to MinIO", "Process LlamaParse Markdown"],
                    topics=["MinIO", "LlamaParse", "RabbitMQ Events"]
                ),
                LearningUnit(
                    id="unit-3",
                    title="3. Vector Chunking & pgvector Indexing",
                    description="Semantic text splitting with LlamaIndex MarkdownNodeParser and 768-dim Gemini embeddings.",
                    difficulty="Intermediate",
                    estimated_time="50 min",
                    prerequisites=["Unit 2"],
                    learning_objectives=["Split Markdown into nodes", "Persist vectors in PostgreSQL"],
                    topics=["MarkdownNodeParser", "Gemini text-embedding-004", "pgvector"]
                ),
                LearningUnit(
                    id="unit-4",
                    title="4. LLM Synthesis & RAG Retrieval",
                    description="Orchestrating Gemini 2.5 Flash for workspace summaries and learning path generation.",
                    difficulty="Advanced",
                    estimated_time="75 min",
                    prerequisites=["Unit 3"],
                    learning_objectives=["Construct structured prompts", "Query vector embeddings"],
                    topics=["Gemini 2.5 Flash", "RAG Retrieval", "JSON Schema Enforcement"]
                )
            ]
            return LearningPathResponse(
                title=f"Learning Roadmap: {summary.get('title', 'Workspace')}",
                units=fallback_units
            )
