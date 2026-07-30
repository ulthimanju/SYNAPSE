import io
import asyncio
import logging
from typing import List, Optional, Set
import httpx
from shared.config import settings
from shared.exceptions import NotFoundException, ForbiddenException, BadRequestException
from ..repositories.document_repository import DocumentRepository
from ..storage.gdrive_service import GoogleDriveStorageService
from ..events.publisher import EventPublisher
from ..schemas.document import DocumentRead

logger = logging.getLogger(__name__)

# Strong references set to prevent Python 3.11+ asyncio task garbage collection
_BACKGROUND_TASKS: Set[asyncio.Task] = set()

class DocumentService:
    """Business logic for Document Processing Service with Google Drive integration."""

    def __init__(
        self,
        doc_repo: Optional[DocumentRepository] = None,
        storage_service: Optional[GoogleDriveStorageService] = None,
        publisher: Optional[EventPublisher] = None,
    ):
        self.doc_repo = doc_repo or DocumentRepository()
        self.storage = storage_service or GoogleDriveStorageService()
        self.publisher = publisher or EventPublisher()

    async def verify_workspace_access(self, workspace_id: str, auth_token: Optional[str] = None) -> None:
        """Verifies workspace access by querying Workspace Service REST API."""
        workspace_service_url = f"http://localhost:8002/workspaces/{workspace_id}"
        headers = {"Authorization": auth_token} if auth_token else {}
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(workspace_service_url, headers=headers)
                if res.status_code == 403:
                    raise ForbiddenException("You are not a member of this workspace")
                elif res.status_code == 404:
                    raise NotFoundException("Target workspace not found")
        except (NotFoundException, ForbiddenException):
            raise
        except Exception:
            # Allow fallback if service is starting up in local dev
            pass

    async def upload_document(
        self,
        workspace_id: str,
        uploaded_by: str,
        filename: str,
        content_type: str,
        file_bytes: bytes,
        auth_token: Optional[str] = None
    ) -> DocumentRead:
        """Uploads file to Google Drive (folder: workspace_id), records metadata, and triggers background processing."""
        if not file_bytes:
            raise BadRequestException("Cannot upload empty file")

        # 1. Verify workspace access via REST call to Workspace Service
        await self.verify_workspace_access(workspace_id=workspace_id, auth_token=auth_token)

        # 2. Upload file to user Google Drive inside folder workspace_id
        storage_key = await self.storage.upload_file(
            workspace_id=workspace_id,
            filename=filename,
            file_bytes=file_bytes,
            content_type=content_type or "application/octet-stream",
            auth_token=auth_token,
        )
        file_size = len(file_bytes)

        # 3. Create document record with status="uploaded"
        doc = await self.doc_repo.create(
            workspace_id=workspace_id,
            filename=filename,
            content_type=content_type or "application/octet-stream",
            file_size=file_size,
            storage_key=storage_key,
            uploaded_by=uploaded_by,
            status="uploaded",
            processing_stage="upload",
        )

        doc_id = str(doc.id)

        # 4. Publish document.uploaded event to RabbitMQ
        await self.publisher.publish_document_uploaded(
            document_id=doc_id,
            workspace_id=workspace_id,
            storage_key=storage_key,
            uploaded_by=uploaded_by
        )

        # 5. Trigger background document processing pipeline directly
        from .parser_service import ParserService
        parser_service = ParserService(
            doc_repo=self.doc_repo,
            storage_service=self.storage,
            publisher=self.publisher
        )

        task = asyncio.create_task(parser_service.parse_and_store_document(
            document_id=doc_id,
            workspace_id=workspace_id,
            storage_key=storage_key,
            auth_token=auth_token
        ))
        _BACKGROUND_TASKS.add(task)
        task.add_done_callback(_BACKGROUND_TASKS.discard)

        return DocumentRead(
            id=doc_id,
            workspace_id=doc.workspace_id,
            filename=doc.filename,
            content_type=doc.content_type,
            file_size=doc.file_size,
            storage_key=doc.storage_key,
            status=doc.status,
            processing_stage=getattr(doc, "processing_stage", "upload") or "upload",
            uploaded_by=doc.uploaded_by,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )

    async def list_workspace_documents(self, workspace_id: str) -> List[DocumentRead]:
        """Lists document metadata for a specific workspace."""
        docs = await self.doc_repo.list_by_workspace(workspace_id)
        return [
            DocumentRead(
                id=str(d.id),
                workspace_id=d.workspace_id,
                filename=d.filename,
                content_type=d.content_type,
                file_size=d.file_size,
                storage_key=d.storage_key,
                status=d.status,
                processing_stage=getattr(d, "processing_stage", "upload") or "upload",
                uploaded_by=d.uploaded_by,
                created_at=d.created_at,
                updated_at=d.updated_at,
            ) for d in docs
        ]

    async def delete_document(self, document_id: str, user_id: str, auth_token: Optional[str] = None) -> bool:
        """Deletes file from Google Drive and metadata record from MongoDB."""
        doc = await self.doc_repo.get_by_id(document_id)
        if not doc:
            raise NotFoundException("Document not found")

        await self.storage.delete_file(doc.storage_key, auth_token=auth_token)
        await self.doc_repo.delete(doc)
        return True

    async def retry_document_processing(
        self,
        document_id: str,
        workspace_id: str,
        user_id: str,
        auth_token: Optional[str] = None
    ) -> DocumentRead:
        """Resets document status to 'processing' and re-spawns ParserService background processing pipeline."""
        doc = await self.doc_repo.get_by_id(document_id)
        if not doc:
            raise NotFoundException("Document not found")

        from ..schemas.enums import DocumentStatus, ProcessingStage
        await self.doc_repo.update_status(
            doc,
            status=DocumentStatus.PROCESSING.value,
            processing_stage=ProcessingStage.PARSE.value
        )

        from .parser_service import ParserService
        parser_service = ParserService(
            doc_repo=self.doc_repo,
            storage_service=self.storage,
            publisher=self.publisher
        )

        task = asyncio.create_task(parser_service.parse_and_store_document(
            document_id=document_id,
            workspace_id=workspace_id,
            storage_key=doc.storage_key,
            auth_token=auth_token
        ))
        _BACKGROUND_TASKS.add(task)
        task.add_done_callback(_BACKGROUND_TASKS.discard)

        return DocumentRead(
            id=str(doc.id),
            workspace_id=doc.workspace_id,
            filename=doc.filename,
            content_type=doc.content_type,
            file_size=doc.file_size,
            storage_key=doc.storage_key,
            status=DocumentStatus.PROCESSING.value,
            processing_stage=ProcessingStage.PARSE.value,
            uploaded_by=doc.uploaded_by,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )
