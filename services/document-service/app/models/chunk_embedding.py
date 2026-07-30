import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, JSON, Column
from sqlalchemy.dialects.postgresql import UUID
from shared.database import Base

class DocumentChunkEmbedding(Base):
    """SQLAlchemy Model for document chunk vector embeddings in PostgreSQL (pgvector)."""
    __tablename__ = "document_chunk_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chunk_id = Column(String, nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    workspace_id = Column(String, nullable=False, index=True)
    embedding = Column(JSON, nullable=False)  # 768-dimensional float vector
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
