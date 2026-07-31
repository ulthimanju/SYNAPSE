import logging
from typing import List, Optional, Any
from ..repositories.document_repository import DocumentRepository
from ..repositories.parsed_document_repository import ParsedDocumentRepository
from ..repositories.chunk_repository import ChunkRepository
from ..models.document_chunk import DocumentChunk
from ..chunking.chunker import LlamaMarkdownChunker
from ..events.publisher import EventPublisher
from ..schemas.enums import DocumentStatus

logger = logging.getLogger(__name__)

class ChunkingService:
    """Service layer for Markdown chunking & chunk persistence."""

    def __init__(
        self,
        doc_repo: Optional[DocumentRepository] = None,
        parsed_doc_repo: Optional[ParsedDocumentRepository] = None,
        chunk_repo: Optional[ChunkRepository] = None,
        chunker: Optional[LlamaMarkdownChunker] = None,
        publisher: Optional[EventPublisher] = None,
    ):
        self.doc_repo = doc_repo or DocumentRepository()
        self.parsed_doc_repo = parsed_doc_repo or ParsedDocumentRepository()
        self.chunk_repo = chunk_repo or ChunkRepository()
        self.chunker = chunker or LlamaMarkdownChunker()
        self.publisher = publisher or EventPublisher()

    async def chunk_document(
        self,
        document_id: str,
        workspace_id: str,
        doc: Optional[Any] = None,
        parsed_doc: Optional[Any] = None,
    ) -> List[DocumentChunk]:
        """Reads parsed Markdown, chunks using MarkdownNodeParser, persists chunks, updates status to 'chunked'."""
        if not doc:
            doc = await self.doc_repo.get_by_id(document_id)
        if not doc:
            logger.warning(f"Document ID {document_id} not found for chunking")
            return []

        if not parsed_doc:
            parsed_doc = await self.parsed_doc_repo.get_by_document_id(document_id)
        if not parsed_doc:
            logger.warning(f"ParsedDocument for doc ID {document_id} missing")
            return []

        try:
            # 1. Parse Markdown into semantic chunks
            raw_chunks = self.chunker.split_markdown(parsed_doc.markdown)

            # 2. Build DocumentChunk models
            chunk_models = [
                DocumentChunk(
                    document_id=document_id,
                    workspace_id=workspace_id,
                    chunk_index=c["chunk_index"],
                    content=c["content"],
                    token_count=c["token_count"],
                    metadata=c["metadata"],
                )
                for c in raw_chunks
            ]

            # 3. Persist chunks
            saved_chunks = await self.chunk_repo.create_chunks(chunk_models)

            # 4. Update document status & stage
            from ..schemas.enums import ProcessingStage
            await self.doc_repo.update_status(
                doc,
                status=DocumentStatus.PROCESSING.value,
                processing_stage=ProcessingStage.CHUNK.value
            )

            # 5. Publish document.chunked event
            await self.publisher.publish_document_chunked(
                document_id=document_id,
                workspace_id=workspace_id,
                chunk_count=len(saved_chunks)
            )

            logger.info(f"Chunked document ID {document_id} into {len(saved_chunks)} semantic nodes")

            # 6. Trigger Embedding Service with pre-loaded doc and saved_chunks models
            from .embedding_service import EmbeddingService
            embedding_service = EmbeddingService(
                doc_repo=self.doc_repo,
                chunk_repo=self.chunk_repo,
                publisher=self.publisher
            )
            await embedding_service.generate_and_store_embeddings(
                document_id=document_id,
                workspace_id=workspace_id,
                doc=doc,
                chunks=saved_chunks
            )
            return saved_chunks

        except Exception as exc:
            reason = str(exc)
            logger.error(f"Chunking failed for doc ID {document_id}: {reason}")
            await self.doc_repo.update_status(doc, status=DocumentStatus.FAILED.value)
            await self.publisher.publish_document_failed(
                document_id=document_id,
                workspace_id=workspace_id,
                reason=reason
            )
            return []
