from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class DocumentRead(BaseModel):
    """Schema for reading document metadata."""
    id: str
    workspace_id: str
    filename: str
    content_type: str
    file_size: int
    storage_key: str
    status: str
    processing_stage: str = Field(default="upload")
    uploaded_by: str
    created_at: datetime
    updated_at: datetime

class DocumentStatusUpdate(BaseModel):
    """Schema for updating document status and stage."""
    status: str = Field(..., description="Status string: 'uploaded', 'processing', 'ready', 'failed'")
    processing_stage: Optional[str] = Field(default=None, description="Stage string: 'upload', 'parse', 'chunk', 'embed', 'complete'")
