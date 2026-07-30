from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RetrievalRequest(BaseModel):
    """Input payload requesting vector similarity retrieval."""
    workspace_id: str = Field(..., description="Target Workspace ID string")
    query: str = Field(..., description="User search query string")
    top_k: int = Field(default=10, ge=1, le=50, description="Top K most similar chunks to retrieve")

class RetrievedChunk(BaseModel):
    """Schema for an individual retrieved chunk with content & score."""
    chunk_id: str = Field(..., description="Document chunk ID")
    document_id: str = Field(..., description="Parent document ID")
    score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    content: str = Field(..., description="Text content of the retrieved chunk")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata such as section path, heading")

class RetrievalResponse(BaseModel):
    """Structured response payload for vector retrieval query."""
    query: str = Field(..., description="Original search query string")
    results: List[RetrievedChunk] = Field(default_factory=list, description="Array of top-k retrieved chunk objects")
