import logging
from typing import List, Optional
from ..repositories.document_repository import DocumentRepository
from ..repositories.parsed_document_repository import ParsedDocumentRepository
from ..storage.minio_client import MinIOStorageService
from ..clients.llama_parse import LlamaParseClient
from ..events.publisher import EventPublisher
from ..schemas.parsed_document import ParsedDocumentRead
from ..schemas.enums import DocumentStatus

from ..storage.gdrive_service import GoogleDriveStorageService

logger = logging.getLogger(__name__)

class ParserService:
    """Service layer handling LlamaParse integration & parsed document persistence."""

    def __init__(
        self,
        doc_repo: Optional[DocumentRepository] = None,
        parsed_doc_repo: Optional[ParsedDocumentRepository] = None,
        storage_service: Optional[GoogleDriveStorageService] = None,
        llama_client: Optional[LlamaParseClient] = None,
        publisher: Optional[EventPublisher] = None,
    ):
        self.doc_repo = doc_repo or DocumentRepository()
        self.parsed_doc_repo = parsed_doc_repo or ParsedDocumentRepository()
        self.storage = storage_service or GoogleDriveStorageService()
        self.llama_client = llama_client or LlamaParseClient()
        self.publisher = publisher or EventPublisher()

    async def parse_and_store_document(
        self,
        document_id: str,
        workspace_id: str,
        storage_key: str,
        auth_token: Optional[str] = None,
        file_bytes: Optional[bytes] = None,
        doc: Optional[Any] = None,
    ) -> bool:
        """Parses document with LlamaParse using in-memory bytes if available, stores in parsed_documents, and triggers chunking."""
        if not doc:
            doc = await self.doc_repo.get_by_id(document_id)
        if not doc:
            logger.warning(f"Document ID {document_id} not found for parsing")
            return False

        # Guard against duplicate executions from RabbitMQ consumer if local task already processed it
        if doc.status in (DocumentStatus.PROCESSING.value, DocumentStatus.READY.value) and file_bytes is None:
            logger.info(f"⚡ Document ID '{document_id}' is already in status '{doc.status}'. Skipping duplicate worker trigger.")
            return True

        try:
            from ..schemas.enums import ProcessingStage
            # 1. Update status to 'processing', stage to 'parse'
            await self.doc_repo.update_status(
                doc,
                status=DocumentStatus.PROCESSING.value,
                processing_stage=ProcessingStage.PARSE.value
            )

            # 2. Download file bytes from Google Drive or storage ONLY if not already in memory
            if file_bytes is None:
                if hasattr(self.storage, "get_file_bytes"):
                    file_bytes = await self.storage.get_file_bytes(storage_key, auth_token=auth_token)
                else:
                    object_data = self.storage.client.get_object(self.storage.bucket_name, storage_key)
                    file_bytes = object_data.read()
                    object_data.close()
                    object_data.release_conn()

            # 3. Parse via LlamaParse client
            title, markdown_content, metadata = await self.llama_client.parse_document(
                file_bytes=file_bytes,
                filename=doc.filename,
                content_type=doc.content_type
            )

            # 4. Persist parsed document
            parsed_doc = await self.parsed_doc_repo.create(
                document_id=document_id,
                title=title,
                markdown=markdown_content,
                metadata=metadata,
                parser="llama_parse"
            )

            # 5. Update status & stage to CHUNK
            await self.doc_repo.update_status(
                doc,
                status=DocumentStatus.PROCESSING.value,
                processing_stage=ProcessingStage.CHUNK.value
            )
            await self.publisher.publish_document_completed(
                document_id=document_id,
                workspace_id=workspace_id
            )
            logger.info(f"Successfully parsed and stored document ID: {document_id}")

            # 6. Trigger Chunking Service with pre-loaded doc and parsed_doc models
            from .chunking_service import ChunkingService
            chunking_service = ChunkingService(
                doc_repo=self.doc_repo,
                parsed_doc_repo=self.parsed_doc_repo,
                publisher=self.publisher
            )
            await chunking_service.chunk_document(
                document_id=document_id,
                workspace_id=workspace_id,
                doc=doc,
                parsed_doc=parsed_doc
            )
            return True

        except Exception as exc:
            reason = str(exc)
            logger.error(f"LlamaParse processing failed for document ID {document_id}: {reason}")
            await self.doc_repo.update_status(doc, status="failed")
            await self.publisher.publish_document_failed(
                document_id=document_id,
                workspace_id=workspace_id,
                reason=reason
            )
            return False

    async def get_parsed_documents_by_workspace(self, workspace_id: str) -> List[dict]:
        """Retrieves parsed Markdown documents for all documents in a workspace (Internal endpoint helper)."""
        docs = await self.doc_repo.list_by_workspace(workspace_id)
        results = []
        for d in docs:
            parsed = await self.parsed_doc_repo.get_by_document_id(str(d.id))
            if parsed:
                results.append({
                    "document_id": str(d.id),
                    "title": parsed.title,
                    "markdown": parsed.markdown,
                })
        return results
