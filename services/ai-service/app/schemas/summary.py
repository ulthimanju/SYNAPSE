from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class VisualizationItem(BaseModel):
    type: str = Field(default="mermaid", description="Visualization diagram type")
    title: str = Field(..., description="Diagram title")
    content: str = Field(..., description="Diagram content (e.g. Mermaid syntax)")

class ComparisonTable(BaseModel):
    title: str = Field(..., description="Comparison table title")
    headers: List[str] = Field(default_factory=list, description="Table column headers")
    rows: List[List[str]] = Field(default_factory=list, description="Table data rows")

class CodeExample(BaseModel):
    language: str = Field(default="java", description="Programming language")
    title: str = Field(..., description="Example title")
    code: str = Field(..., description="Source code snippet")

class WorkspaceSummaryRequest(BaseModel):
    """Input payload requesting workspace summary generation."""
    workspace_id: str = Field(..., description="Target Workspace ID string")

class WorkspaceSummaryResponse(BaseModel):
    """Structured response payload for workspace summary."""
    title: str = Field(..., description="Executive summary title")
    overview: str = Field(..., description="High-level overview synthesis")
    visualizations: List[VisualizationItem] = Field(default_factory=list, description="Diagram visualizations")
    comparison_tables: List[ComparisonTable] = Field(default_factory=list, description="Comparison tables")
    code_examples: List[CodeExample] = Field(default_factory=list, description="Code examples")
    key_topics: List[str] = Field(default_factory=list, description="Extracted key topics")
    difficulty: str = Field(default="Intermediate", description="Target difficulty level")
    estimated_study_time: str = Field(default="6 hours", description="Estimated study time required")
