from typing import List
from pydantic import BaseModel, Field

class LearningUnit(BaseModel):
    """Schema for individual learning module unit."""
    id: str = Field(..., description="Unique unit identifier")
    title: str = Field(..., description="Module title")
    description: str = Field(..., description="Module description and core learning concept")
    difficulty: str = Field(default="Beginner", description="Target difficulty level")
    estimated_time: str = Field(default="45 min", description="Estimated study time")
    prerequisites: List[str] = Field(default_factory=list, description="Prerequisite concepts or units")
    learning_objectives: List[str] = Field(default_factory=list, description="Measurable learning outcomes")
    topics: List[str] = Field(default_factory=list, description="Specific topics covered")

class LearningPathRequest(BaseModel):
    """Input payload requesting learning path generation."""
    workspace_id: str = Field(..., description="Target Workspace ID string")

class LearningPathResponse(BaseModel):
    """Structured response payload for learning path roadmap."""
    title: str = Field(..., description="Learning path title")
    units: List[LearningUnit] = Field(default_factory=list, description="Ordered sequence of learning units")
