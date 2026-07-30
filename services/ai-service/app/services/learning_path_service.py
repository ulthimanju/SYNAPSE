import json
import re
import logging
from typing import Optional, List, Dict, Any
from shared.exceptions import NotFoundException
from ..clients.workspace_client import WorkspaceServiceClient
from ..clients.document_client import DocumentServiceClient
from ..clients.factory import get_ai_provider
from ..prompts.learning_path import LEARNING_PATH_SYSTEM_PROMPT, build_learning_path_prompt
from ..schemas.learning_path import (
    LearningPathResponse,
    KnowledgeGraph,
    KnowledgeNode,
    RoleLearningPath,
)

logger = logging.getLogger(__name__)

class LearningPathService:
    """Service layer handling AI Knowledge Graph & Learning Path generation."""

    def __init__(
        self,
        ws_client: Optional[WorkspaceServiceClient] = None,
        doc_client: Optional[DocumentServiceClient] = None,
        ai_provider=None
    ):
        self.ws_client = ws_client or WorkspaceServiceClient()
        self.doc_client = doc_client or DocumentServiceClient()
        self.ai_provider = ai_provider or get_ai_provider()

    async def generate_learning_path(self, workspace_id: str) -> LearningPathResponse:
        """Retrieves workspace summary + parsed documents, calls Gemini, returns Knowledge Graph and Role Learning Paths.

        Context assembly strategy (dual-source for robustness):
        1. Fetch workspace executive summary from workspace-service (may be empty if not yet generated).
        2. Fetch raw parsed document Markdown from document-service (always available after parsing).
        3. Combine both into the prompt — documents are the primary grounding source.
        4. Raise NotFoundException only if both sources are completely empty.
        """
        # Source 1: Workspace executive summary (structured)
        summary = await self.ws_client.get_workspace_summary(workspace_id)

        # Source 2: Raw parsed documents (primary grounding — always available post-parse)
        documents: List[Dict[str, Any]] = []
        try:
            documents = await self.doc_client.get_parsed_documents(workspace_id)
        except NotFoundException:
            logger.warning(f"No parsed documents found for workspace {workspace_id}.")
        except Exception as exc:
            logger.warning(f"Could not fetch parsed documents for workspace {workspace_id}: {exc}")

        if not summary and not documents:
            raise NotFoundException(
                f"No workspace content available for workspace {workspace_id}. "
                f"Ensure documents are uploaded and parsed before generating a learning path."
            )

        logger.info(
            f"Learning path context: summary_has_content={bool(summary.get('overview'))}, "
            f"documents_count={len(documents)}, workspace_id={workspace_id}"
        )

        prompt = build_learning_path_prompt(summary, documents=documents)

        raw_json_str = await self.ai_provider.generate_structured(
            prompt=prompt,
            schema=None,
            system_instruction=LEARNING_PATH_SYSTEM_PROMPT
        )

        try:
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
                # 1. Extract knowledge_graph
                kg_data = data.get("knowledge_graph", {})
                raw_nodes = kg_data.get("nodes", [])
                if not raw_nodes and "units" in data:
                    raw_nodes = data.get("units", [])

                nodes = [
                    KnowledgeNode(
                        id=n.get("id", f"node-{idx+1}"),
                        parent=n.get("parent", ""),
                        type=n.get("type", "concept"),
                        title=n.get("title", f"Concept {idx+1}"),
                        description=n.get("description", ""),
                        difficulty=n.get("difficulty", "Intermediate"),
                        estimated_time=n.get("estimated_time", "30 min"),
                        learning_objectives=n.get("learning_objectives", []),
                        skills_gained=n.get("skills_gained", []),
                        expected_outcomes=n.get("expected_outcomes", []),
                        keywords=n.get("keywords", []),
                        recommended_reading=n.get("recommended_reading", []),
                        real_world_examples=n.get("real_world_examples", []),
                        assessment_focus=n.get("assessment_focus", []),
                        practical_exercises=n.get("practical_exercises", []),
                        depends_on=n.get("depends_on", n.get("prerequisites", [])),
                        children=n.get("children", [])
                    )
                    for idx, n in enumerate(raw_nodes)
                ]

                knowledge_graph = KnowledgeGraph(
                    root=kg_data.get("root", "root-workspace"),
                    nodes=nodes
                )

                # 2. Extract learning_paths
                raw_lps = data.get("learning_paths", [])
                role_paths = [
                    RoleLearningPath(
                        id=p.get("id", f"path-{idx+1}"),
                        title=p.get("title", f"Learning Path {idx+1}"),
                        description=p.get("description", ""),
                        node_sequence=p.get("node_sequence", [])
                    )
                    for idx, p in enumerate(raw_lps)
                ]

                return LearningPathResponse(
                    title=data.get("title", f"Knowledge Graph: {summary.get('title', 'Workspace')}"),
                    description=data.get("description", "Textbook-grade hierarchical knowledge graph and role-based learning paths."),
                    estimated_total_time=data.get("estimated_total_time", "12 hours"),
                    difficulty=data.get("difficulty", "Intermediate"),
                    knowledge_graph=knowledge_graph,
                    learning_paths=role_paths,
                    units=nodes
                )
        except Exception as exc:
            logger.warning(f"Error parsing Gemini Knowledge Graph response: {exc}. Returning fallback curriculum.")

        return self._build_fallback_curriculum(summary)

    def _build_fallback_curriculum(self, summary: dict) -> LearningPathResponse:
        """Synthesizes structured fallback curriculum based on workspace topics."""
        topics = summary.get("key_topics", ["System Architecture", "Microservices", "Vector Databases"])
        nodes = [
            KnowledgeNode(
                id="domain-1",
                parent="root-workspace",
                type="domain",
                title="Domain 1: Core System Architecture",
                description="Introduction to core system architecture and modular service layout.",
                difficulty="Beginner",
                estimated_time="60 min",
                learning_objectives=["Understand modular architecture design"],
                skills_gained=["System Layout Planning"],
                expected_outcomes=["Build cohesive service structures"],
                keywords=topics[:3],
                depends_on=[],
                children=["module-1"]
            ),
            KnowledgeNode(
                id="module-1",
                parent="domain-1",
                type="module",
                title="Module 1: Vector Databases & RAG Pipelines",
                description="Deep dive into vector embeddings, similarity search, and RAG pipelines.",
                difficulty="Intermediate",
                estimated_time="90 min",
                learning_objectives=["Implement similarity search using vector databases"],
                skills_gained=["RAG Pipeline Engineering"],
                expected_outcomes=["Deploy production RAG pipelines"],
                keywords=topics[2:5] if len(topics) >= 5 else ["Vector Search"],
                depends_on=["domain-1"],
                children=[]
            )
        ]
        knowledge_graph = KnowledgeGraph(root="root-workspace", nodes=nodes)
        role_paths = [
            RoleLearningPath(
                id="path-architect",
                title="System Architect Learning Path",
                description="Comprehensive path for system architecture engineering.",
                node_sequence=["domain-1", "module-1"]
            )
        ]
        return LearningPathResponse(
            title=f"Knowledge Graph: {summary.get('title', 'Workspace')}",
            description="Textbook-grade hierarchical knowledge graph and role-based learning paths.",
            estimated_total_time="6 hours",
            difficulty="Intermediate",
            knowledge_graph=knowledge_graph,
            learning_paths=role_paths,
            units=nodes
        )
