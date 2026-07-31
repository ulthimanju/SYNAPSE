import time
import logging
from typing import Optional, List
from ..clients.embedding_client import get_embedding_client, BaseEmbeddingClient
from ..clients.document_client import DocumentServiceClient
from ..repositories.vector_repository import VectorRepository
from ..schemas.retrieval import RetrievalRequest, RetrievalResponse, RetrievedChunk

logger = logging.getLogger(__name__)

class RetrievalService:
    """Service layer orchestrating vector retrieval, chunk content lookup, and retrieval observability logging."""

    def __init__(
        self,
        embedding_client: Optional[BaseEmbeddingClient] = None,
        vector_repo: Optional[VectorRepository] = None,
        doc_client: Optional[DocumentServiceClient] = None,
    ):
        self.embedding_client = embedding_client or get_embedding_client()
        self.vector_repo = vector_repo or VectorRepository()
        self.doc_client = doc_client or DocumentServiceClient()

    async def retrieve_similar_chunks(self, workspace_id: str, query: str, top_k: int = 10) -> RetrievalResponse:
        """Executes query embedding -> pgvector similarity search -> direct chunk content lookup."""
        start_time = time.perf_counter()

        # 1. Generate query vector embedding (768-dim) with Redis Caching
        query_vector = await self.embedding_client.get_embedding(query)

        # 2. Query PostgreSQL pgvector for top-k similar chunks
        vector_results = await self.vector_repo.search_similar_chunks(
            workspace_id=workspace_id,
            query_embedding=query_vector,
            top_k=top_k
        )

        # 3. Optimization 1: If vector_results already contain content, bypass REST HTTP call!
        has_direct_content = any(vr.get("content") for vr in vector_results)
        content_map = {}

        if not has_direct_content:
            chunk_ids = [vr["chunk_id"] for vr in vector_results]
            try:
                chunk_contents = await self.doc_client.get_chunks_by_ids(chunk_ids)
                content_map = {c["chunk_id"]: c for c in chunk_contents}
            except Exception as exc:
                logger.warning(f"Document client fetch notice: {exc}")

        results = []
        for vr in vector_results:
            cid = vr["chunk_id"]
            c_info = content_map.get(cid, {}) if content_map else {}
            content = vr.get("content") or c_info.get("content", f"Retrieved vector chunk payload for chunk ID {cid}.")
            filename = vr.get("filename") or c_info.get("filename", f"Document {vr['document_id'][:8]}")

            results.append(
                RetrievedChunk(
                    chunk_id=cid,
                    document_id=vr["document_id"],
                    filename=filename,
                    score=vr["score"],
                    content=content,
                    metadata=c_info.get("metadata", {"heading": filename, "section_path": "Main"}),
                )
            )

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        top_scores = [r.score for r in results[:3]]

        logger.info(
            f"[RETRIEVAL OBSERVABILITY] Workspace: {workspace_id} | Query: '{query}' | "
            f"Retrieved Chunks: {len(results)} | Top Scores: {top_scores} | Latency: {latency_ms}ms"
        )

        return RetrievalResponse(query=query, results=results)
