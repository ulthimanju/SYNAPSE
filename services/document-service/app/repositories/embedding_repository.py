import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.chunk_embedding import DocumentChunkEmbedding

class EmbeddingRepository:
    """Repository for managing DocumentChunkEmbedding records in PostgreSQL (pgvector)."""

    async def save_chunk_embeddings(
        self,
        session: AsyncSession,
        records: List[Dict[str, Any]]
    ) -> List[DocumentChunkEmbedding]:
        if not records:
            return []

        embeddings = [
            DocumentChunkEmbedding(
                id=uuid.uuid4(),
                chunk_id=r["chunk_id"],
                document_id=r["document_id"],
                workspace_id=r["workspace_id"],
                embedding=r["embedding"],
            )
            for r in records
        ]
        session.add_all(embeddings)
        await session.commit()
        return embeddings
