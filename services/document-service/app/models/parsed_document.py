from datetime import datetime, timezone
from typing import Dict, Any
from beanie import Document as BeanieDocument
from pydantic import Field

class ParsedDocument(BeanieDocument):
    """Beanie MongoDB Model for normalized Markdown parsed document output."""
    document_id: str = Field(..., index=True, description="Reference ID to parent Document")
    title: str = Field(..., max_length=255, description="Extracted document title")
    markdown: str = Field(..., description="Normalized Markdown content string")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Parsing metadata (pages, language, etc.)")
    parser: str = Field(default="llama_parse", description="Parser engine name")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "parsed_documents"
