from datetime import datetime, timezone
from typing import Dict, Any
from beanie import Document as BeanieDocument
from pydantic import Field

class DocumentChunk(BeanieDocument):
    """Beanie MongoDB Model for semantic document chunk."""
    document_id: str = Field(..., index=True, description="Reference ID to parent Document")
    workspace_id: str = Field(..., index=True, description="Reference ID to target Workspace")
    chunk_index: int = Field(..., ge=0, description="Zero-based sequence index of the chunk")
    content: str = Field(..., description="Normalized Markdown text content of the chunk")
    token_count: int = Field(default=0, ge=0, description="Approximate word/token count")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata (heading, section_path, parser)")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "document_chunks"
