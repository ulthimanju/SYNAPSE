from datetime import datetime, timezone
from beanie import Document as BeanieDocument
from pydantic import Field

class Document(BeanieDocument):
    """Beanie MongoDB Model for Document metadata."""
    workspace_id: str = Field(..., index=True, description="Target Workspace ID string")
    filename: str = Field(..., max_length=255, description="Original filename")
    content_type: str = Field(default="application/octet-stream", description="MIME content type")
    file_size: int = Field(..., ge=0, description="File size in bytes")
    storage_key: str = Field(..., index=True, description="MinIO object storage key")
    status: str = Field(default="uploaded", description="Lifecycle status: 'uploaded', 'processing', 'ready', 'failed'")
    processing_stage: str = Field(default="upload", description="Pipeline stage: 'upload', 'parse', 'chunk', 'embed', 'complete'")
    uploaded_by: str = Field(..., index=True, description="User ID of the uploader")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "documents"
