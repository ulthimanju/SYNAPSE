import logging
from typing import Dict, Any
from .parser_service import ParserService

logger = logging.getLogger(__name__)

class DocumentProcessingService:
    """Async background worker for delegating document.uploaded events to ParserService."""

    def __init__(self, parser_service: ParserService | None = None):
        self.parser_service = parser_service or ParserService()

    async def process_document_event(self, event_data: Dict[str, Any]) -> bool:
        """Processes document.uploaded event via ParserService."""
        doc_id = event_data.get("document_id")
        workspace_id = event_data.get("workspace_id")
        storage_key = event_data.get("storage_key")

        if not doc_id or not workspace_id or not storage_key:
            logger.warning("Received invalid document.uploaded event data")
            return False

        return await self.parser_service.parse_and_store_document(
            document_id=doc_id,
            workspace_id=workspace_id,
            storage_key=storage_key
        )
