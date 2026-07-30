import json
import re
import logging
from typing import Optional, List
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
        """Retrieves full workspace summary payload, calls Gemini Direct Engine, and returns structured learning path."""
        summary = await self.ws_client.get_workspace_summary(workspace_id)
        if not summary:
            raise NotFoundException(f"No summary available for workspace {workspace_id}")

        prompt = build_learning_path_prompt(summary)

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
                raw_units = data.get("units", [])
                units = [
                    LearningUnit(
                        id=u.get("id", f"unit-{idx+1}"),
                        title=u.get("title", f"Unit {idx+1}"),
                        description=u.get("description", "Core educational module."),
                        difficulty=u.get("difficulty", "Intermediate"),
                        estimated_time=u.get("estimated_time", "60 min"),
                        prerequisites=u.get("prerequisites", []),
                        learning_objectives=u.get("learning_objectives", []),
                        topics=u.get("topics", []),
                        skills_gained=u.get("skills_gained", []),
                        expected_outcomes=u.get("expected_outcomes", []),
                        recommended_reading=u.get("recommended_reading", []),
                        keywords=u.get("keywords", []),
                        concept_dependencies=u.get("concept_dependencies", []),
                        real_world_examples=u.get("real_world_examples", []),
                        assessment_focus=u.get("assessment_focus", []),
                        practical_exercises=u.get("practical_exercises", [])
                    )
                    for idx, u in enumerate(raw_units)
                ]
                return LearningPathResponse(
                    title=data.get("title", f"Curriculum Roadmap: {summary.get('title', 'Workspace')}"),
                    description=data.get("description", "Comprehensive, dependency-aware learning curriculum."),
                    estimated_total_time=data.get("estimated_total_time", "12 hours"),
                    difficulty=data.get("difficulty", "Intermediate"),
                    units=units
                )
        except Exception as exc:
            logger.warning(f"Error parsing Gemini JSON response: {exc}. Returning fallback learning path.")

        return self._build_fallback_curriculum(summary)

    def _build_fallback_curriculum(self, summary: dict) -> LearningPathResponse:
        """Synthesizes structured fallback curriculum based on workspace topics."""
        topics = summary.get("key_topics", ["OOP Principles", "Java Classes", "Polymorphism"])
        units = [
            LearningUnit(
                id="unit-1",
                title="1. Core Foundations & Paradigm Fundamentals",
                description="Introduction to fundamental paradigm principles, domain modeling, and data encapsulation.",
                difficulty="Beginner",
                estimated_time="60 min",
                prerequisites=[],
                learning_objectives=["Understand object vs procedural modeling", "Encapsulate class state"],
                topics=topics[:2] if len(topics) >= 2 else ["Foundations"],
                skills_gained=["Domain Class Design", "Data Hiding"],
                expected_outcomes=["Build cohesive class blueprints"],
                keywords=topics[:3],
                concept_dependencies=["State & Behavior"],
                real_world_examples=["Banking Account Encapsulation"],
                assessment_focus=["Data Hiding vs Public Interfaces"],
                practical_exercises=["Implement encapsulated BankAccount class"]
            ),
            LearningUnit(
                id="unit-2",
                title="2. Polymorphism Mechanics & Dynamic Binding",
                description="Deep dive into compile-time overloading, runtime method overriding, and interface polymorphism.",
                difficulty="Intermediate",
                estimated_time="75 min",
                prerequisites=["unit-1"],
                learning_objectives=["Implement method overriding", "Leverage interface dynamic binding"],
                topics=topics[2:4] if len(topics) >= 4 else ["Polymorphism"],
                skills_gained=["Dynamic Method Dispatch", "Interface Abstraction"],
                expected_outcomes=["Construct flexible polymorphic architectures"],
                keywords=["Overriding", "Dynamic Binding", "Interface"],
                concept_dependencies=["unit-1"],
                real_world_examples=["Payment Processor Dispatch"],
                assessment_focus=["Overloading vs Overriding"],
                practical_exercises=["Build dynamic Payment Gateway interface hierarchy"]
            )
        ]
        return LearningPathResponse(
            title=f"Curriculum Roadmap: {summary.get('title', 'Workspace')}",
            description="Comprehensive university-level curriculum.",
            estimated_total_time="6 hours",
            difficulty="Intermediate",
            units=units
        )
