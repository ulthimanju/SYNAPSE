import logging
from typing import List, Dict, Any
from sqlalchemy import text
from shared.database import vectors_postgres_manager

logger = logging.getLogger(__name__)

class VectorRepository:
    """Repository querying pgvector vector similarity search in PostgreSQL."""

    async def _ensure_columns_exist(self, session):
        """Ensures content and filename columns exist in document_chunk_embeddings table."""
        try:
            await session.execute(text("ALTER TABLE document_chunk_embeddings ADD COLUMN IF NOT EXISTS content TEXT;"))
            await session.execute(text("ALTER TABLE document_chunk_embeddings ADD COLUMN IF NOT EXISTS filename TEXT;"))
            await session.commit()
        except Exception:
            pass

    async def search_similar_chunks(
        self,
        workspace_id: str,
        query_embedding: List[float],
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """Queries document_chunk_embeddings table in PostgreSQL using vector distance (<->) filtered by workspace_id."""
        if not query_embedding:
            return []

        embedding_str = "[" + ",".join(str(f) for f in query_embedding) + "]"
        
        try:
            async with vectors_postgres_manager.session_factory() as session:
                await self._ensure_columns_exist(session)
                
                # 1. Try querying with content and filename columns
                sql = text("""
                    SELECT 
                        chunk_id,
                        document_id,
                        content,
                        filename,
                        1 - (embedding <=> CAST(:emb AS vector)) AS similarity_score
                    FROM document_chunk_embeddings
                    WHERE workspace_id = :workspace_id
                    ORDER BY embedding <=> CAST(:emb AS vector) ASC
                    LIMIT :top_k
                """)
                
                try:
                    result = await session.execute(
                        sql,
                        {
                            "emb": embedding_str,
                            "workspace_id": workspace_id,
                            "top_k": top_k,
                        }
                    )
                    rows = result.fetchall()
                    return [
                        {
                            "chunk_id": str(row.chunk_id),
                            "document_id": str(row.document_id),
                            "content": getattr(row, "content", None),
                            "filename": getattr(row, "filename", None),
                            "score": round(float(row.similarity_score), 4),
                        }
                        for row in rows
                    ]
                except Exception as col_exc:
                    logger.info(f"Fallback to core vector search without content columns: {col_exc}")
                    # Fallback query without content/filename columns
                    fallback_sql = text("""
                        SELECT 
                            chunk_id,
                            document_id,
                            1 - (embedding <=> CAST(:emb AS vector)) AS similarity_score
                        FROM document_chunk_embeddings
                        WHERE workspace_id = :workspace_id
                        ORDER BY embedding <=> CAST(:emb AS vector) ASC
                        LIMIT :top_k
                    """)
                    result = await session.execute(
                        fallback_sql,
                        {
                            "emb": embedding_str,
                            "workspace_id": workspace_id,
                            "top_k": top_k,
                        }
                    )
                    rows = result.fetchall()
                    return [
                        {
                            "chunk_id": str(row.chunk_id),
                            "document_id": str(row.document_id),
                            "content": None,
                            "filename": None,
                            "score": round(float(row.similarity_score), 4),
                        }
                        for row in rows
                    ]

        except Exception as exc:
            logger.warning(f"PostgreSQL pgvector search warning: {exc}.")
            return []
