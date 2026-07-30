from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class KnowledgeNode(BaseModel):
    """Schema for individual node in the hierarchical knowledge graph."""
    id: str = Field(..., description="Unique node identifier (e.g. domain-1, concept-rag)")
    parent: Optional[str] = Field(default="", description="Parent node ID or empty string for root")
    type: str = Field(default="concept", description="Node type: domain | module | concept | lesson")
    title: str = Field(..., description="Node title")
    description: str = Field(default="", description="Detailed description")
    difficulty: str = Field(default="Beginner", description="Target difficulty level")
    estimated_time: str = Field(default="30 min", description="Estimated study time")
    learning_objectives: List[str] = Field(default_factory=list, description="Learning objectives")
    skills_gained: List[str] = Field(default_factory=list, description="Skills gained")
    expected_outcomes: List[str] = Field(default_factory=list, description="Expected outcomes")
    keywords: List[str] = Field(default_factory=list, description="Keywords")
    recommended_reading: List[str] = Field(default_factory=list, description="Recommended readings")
    real_world_examples: List[str] = Field(default_factory=list, description="Real world examples")
    assessment_focus: List[str] = Field(default_factory=list, description="Assessment focus")
    practical_exercises: List[str] = Field(default_factory=list, description="Practical exercises")
    depends_on: List[str] = Field(default_factory=list, description="Prerequisite concept node IDs")
    children: List[str] = Field(default_factory=list, description="Child node IDs")

class KnowledgeGraph(BaseModel):
    """Schema for complete workspace hierarchical knowledge graph."""
    root: str = Field(default="root-workspace", description="Root node ID")
    nodes: List[KnowledgeNode] = Field(default_factory=list, description="Hierarchical nodes")

class RoleLearningPath(BaseModel):
    """Derived role-specific learning sequence through the knowledge graph."""
    id: str = Field(..., description="Unique path identifier (e.g. path-backend)")
    title: str = Field(..., description="Role path title (e.g. Backend Engineer Path)")
    description: str = Field(default="", description="Role path overview")
    node_sequence: List[str] = Field(default_factory=list, description="Ordered sequence of node IDs")

class LearningPathRequest(BaseModel):
    """Input payload requesting learning path generation."""
    workspace_id: str = Field(..., description="Target Workspace ID string")

class LearningPathResponse(BaseModel):
    """Structured response payload for hierarchical Knowledge Graph and Role-Based Learning Paths."""
    title: str = Field(..., description="Curriculum title")
    description: str = Field(default="Textbook-grade hierarchical knowledge graph and role-based learning paths.", description="Curriculum description")
    estimated_total_time: str = Field(default="12 hours", description="Total estimated study time")
    difficulty: str = Field(default="Intermediate", description="Overall difficulty")
    knowledge_graph: KnowledgeGraph = Field(default_factory=KnowledgeGraph, description="Hierarchical knowledge graph")
    learning_paths: List[RoleLearningPath] = Field(default_factory=list, description="Role-based learning paths")
    units: List[KnowledgeNode] = Field(default_factory=list, description="Flat list of graph nodes for backward compatibility")
