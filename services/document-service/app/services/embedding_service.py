import logging
from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from shared.database import vectors_postgres_manager
from ..repositories.document_repository import DocumentRepository
from ..repositories.chunk_repository import ChunkRepository
from ..repositories.embedding_repository import EmbeddingRepository
from ..clients.embedding_client import GeminiEmbeddingClient
from ..events.publisher import EventPublisher
from ..schemas.enums import DocumentStatus, ProcessingStage

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service layer for vector embedding generation & pgvector persistence."""

    def __init__(
        self,
        doc_repo: Optional[DocumentRepository] = None,
        chunk_repo: Optional[ChunkRepository] = None,
        embedding_repo: Optional[EmbeddingRepository] = None,
        embedding_client: Optional[GeminiEmbeddingClient] = None,
        publisher: Optional[EventPublisher] = None,
    ):
        self.doc_repo = doc_repo or DocumentRepository()
        self.chunk_repo = chunk_repo or ChunkRepository()
        self.embedding_repo = embedding_repo or EmbeddingRepository()
        self.embedding_client = embedding_client or GeminiEmbeddingClient()
        self.publisher = publisher or EventPublisher()

    async def generate_and_store_embeddings(
        self,
        document_id: str,
        workspace_id: str,
        doc: Optional[Any] = None,
        chunks: Optional[Any] = None,
    ) -> bool:
        """Reads document chunks, generates 768-dim embeddings via Gemini API, stores vectors in PostgreSQL, updates status to 'ready'."""
        if not doc:
            doc = await self.doc_repo.get_by_id(document_id)
        if not doc:
            logger.warning(f"Document ID {document_id} not found for embedding generation")
            return False

        if not chunks:
            chunks = await self.chunk_repo.get_chunks_by_document(document_id)
        if not chunks:
            logger.warning(f"No semantic chunks found for document ID {document_id}")
            return False

        try:
            # 1. Update status to 'processing', stage to 'embed'
            await self.doc_repo.update_status(
                doc,
                status=DocumentStatus.PROCESSING.value,
                processing_stage=ProcessingStage.EMBED.value
            )

            # 2. Extract chunk texts & generate 768-dim embeddings
            chunk_texts = [c.content for c in chunks]
            vector_list = self.embedding_client.generate_embeddings(chunk_texts)

            # 3. Prepare records for pgvector persistence
            filename = getattr(doc, "filename", "Document")
            embedding_records = [
                {
                    "chunk_id": str(chunks[i].id),
                    "document_id": document_id,
                    "workspace_id": workspace_id,
                    "content": chunks[i].content,
                    "filename": filename,
                    "embedding": vector_list[i],
                }
                for i in range(len(chunks))
            ]

            # 4. Save to PostgreSQL pgvector
            async with vectors_postgres_manager.session_factory() as session:
                await self.embedding_repo.save_chunk_embeddings(session, embedding_records)
            logger.info(f"Persisted {len(embedding_records)} vector embeddings into pgvector for doc {document_id}")

            # 5. Update document status to 'ready', stage to 'complete'
            await self.doc_repo.update_status(
                doc,
                status=DocumentStatus.READY.value,
                processing_stage=ProcessingStage.COMPLETE.value
            )

            # 6. Publish document.embedded event
            await self.publisher.publish_document_embedded(
                document_id=document_id,
                workspace_id=workspace_id,
                embedding_count=len(embedding_records)
            )

            logger.info(f"Generated and stored embeddings for document ID {document_id} ({len(embedding_records)} vectors)")
            return True

        except Exception as exc:
            reason = str(exc)
            logger.error(f"Embedding generation failed for document ID {document_id}: {reason}")
            await self.doc_repo.update_status(
                doc,
                status=DocumentStatus.FAILED.value,
                processing_stage=ProcessingStage.EMBED.value
            )
            await self.publisher.publish_document_failed(
                document_id=document_id,
                workspace_id=workspace_id,
                reason=reason
            )
            return False
