from typing import List, Optional
import json
import logging
from beanie import PydanticObjectId
from ..models.document import Document

logger = logging.getLogger(__name__)

class DocumentRepository:
    """Repository for managing Document metadata in MongoDB."""

    async def create(
        self,
        workspace_id: str,
        filename: str,
        content_type: str,
        file_size: int,
        storage_key: str,
        uploaded_by: str,
        status: str = "uploaded",
        processing_stage: str = "upload",
    ) -> Document:
        doc = Document(
            workspace_id=workspace_id,
            filename=filename,
            content_type=content_type,
            file_size=file_size,
            storage_key=storage_key,
            status=status,
            processing_stage=processing_stage,
            uploaded_by=uploaded_by,
        )
        await doc.insert()
        return doc

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        try:
            return await Document.get(PydanticObjectId(document_id))
        except Exception:
            return None

    async def list_by_workspace(self, workspace_id: str) -> List[Document]:
        return await Document.find({"workspace_id": workspace_id}).sort("-created_at").to_list()

    async def update_status(self, doc: Document, status: str, processing_stage: Optional[str] = None) -> Document:
        doc.status = status
        if processing_stage:
            doc.processing_stage = processing_stage
        await doc.save()

        # Publish real-time SSE event via Redis pub/sub
        try:
            from shared.cache.redis_client import redis_cache_manager
            redis_client = await redis_cache_manager.get_client()
            channel = f"doc_status:{doc.workspace_id}"
            payload = json.dumps({
                "event": "document.status",
                "document_id": str(doc.id),
                "workspace_id": doc.workspace_id,
                "status": status,
                "processing_stage": processing_stage or getattr(doc, "processing_stage", None),
                "filename": doc.filename,
            })
            await redis_client.publish(channel, payload)
        except Exception as e:
            logger.warning(f"SSE Redis pub/sub publish failed (non-critical): {e}")

        return doc

    async def delete(self, doc: Document) -> bool:
        await doc.delete()
        return True

