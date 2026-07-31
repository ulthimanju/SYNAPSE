import uuid
from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.chunk_embedding import DocumentChunkEmbedding

class EmbeddingRepository:
    """Repository for managing DocumentChunkEmbedding records in PostgreSQL (pgvector)."""

    async def save_chunk_embeddings(
        self,
        session: AsyncSession,
        records: List[Dict[str, Any]]
    ) -> bool:
        if not records:
            return True

        params = [
            {
                "chunk_id": str(r["chunk_id"]),
                "document_id": str(r["document_id"]),
                "workspace_id": str(r["workspace_id"]),
                "content": r.get("content", ""),
                "filename": r.get("filename", ""),
                "emb": "[" + ",".join(str(f) for f in r["embedding"]) + "]"
            }
            for r in records
        ]
        sql = text("""
            INSERT INTO document_chunk_embeddings (id, chunk_id, document_id, workspace_id, content, filename, embedding, created_at)
            VALUES (gen_random_uuid(), :chunk_id, :document_id, :workspace_id, :content, :filename, CAST(:emb AS vector), CURRENT_TIMESTAMP)
        """)
        await session.execute(sql, params)
        await session.commit()
        return True
