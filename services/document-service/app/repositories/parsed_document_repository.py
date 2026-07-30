from typing import Optional, Dict, Any
from ..models.parsed_document import ParsedDocument

class ParsedDocumentRepository:
    """Repository for managing ParsedDocument records in MongoDB."""

    async def create(
        self,
        document_id: str,
        title: str,
        markdown: str,
        metadata: Optional[Dict[str, Any]] = None,
        parser: str = "llama_parse",
    ) -> ParsedDocument:
        parsed_doc = ParsedDocument(
            document_id=document_id,
            title=title,
            markdown=markdown,
            metadata=metadata or {},
            parser=parser,
        )
        await parsed_doc.insert()
        return parsed_doc

    async def get_by_document_id(self, document_id: str) -> Optional[ParsedDocument]:
        return await ParsedDocument.find_one({"document_id": document_id})
