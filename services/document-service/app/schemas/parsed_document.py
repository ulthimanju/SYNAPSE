from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class ParsedDocumentRead(BaseModel):
    """Schema for reading parsed document metadata."""
    id: str
    document_id: str
    title: str
    markdown: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    parser: str = Field(default="llama_parse")
    created_at: datetime
    updated_at: datetime
