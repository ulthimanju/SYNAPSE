from typing import List, Optional
from pydantic import BaseModel, Field

class LearningUnit(BaseModel):
    """Enriched schema for individual curriculum module unit."""
    id: str = Field(..., description="Unique unit identifier (e.g. unit-1)")
    title: str = Field(..., description="Module title")
    description: str = Field(..., description="Detailed description (2-4 paragraphs)")
    difficulty: str = Field(default="Beginner", description="Target difficulty level")
    estimated_time: str = Field(default="45 min", description="Estimated study time")
    prerequisites: List[str] = Field(default_factory=list, description="Prerequisite unit IDs (e.g. unit-1)")
    learning_objectives: List[str] = Field(default_factory=list, description="Measurable learning outcomes")
    topics: List[str] = Field(default_factory=list, description="Specific topics covered")
    skills_gained: List[str] = Field(default_factory=list, description="Practical skills acquired")
    expected_outcomes: List[str] = Field(default_factory=list, description="Expected operational outcomes")
    recommended_reading: List[str] = Field(default_factory=list, description="Recommended readings or reference material")
    keywords: List[str] = Field(default_factory=list, description="Key concepts and search tags")
    concept_dependencies: List[str] = Field(default_factory=list, description="Conceptual dependencies")
    real_world_examples: List[str] = Field(default_factory=list, description="Industry and software use cases")
    assessment_focus: List[str] = Field(default_factory=list, description="Assessment and interview evaluation areas")
    practical_exercises: List[str] = Field(default_factory=list, description="Hands-on coding or architectural exercises")

class LearningPathRequest(BaseModel):
    """Input payload requesting learning path generation."""
    workspace_id: str = Field(..., description="Target Workspace ID string")

class LearningPathResponse(BaseModel):
    """Structured response payload for learning path roadmap."""
    title: str = Field(..., description="Curriculum title")
    description: str = Field(default="Comprehensive university-level curriculum.", description="Curriculum description")
    estimated_total_time: str = Field(default="10 hours", description="Total estimated time")
    difficulty: str = Field(default="Intermediate", description="Overall difficulty")
    units: List[LearningUnit] = Field(default_factory=list, description="Ordered sequence of learning units")
