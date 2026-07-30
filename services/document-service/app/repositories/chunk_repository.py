from typing import List
from ..models.document_chunk import DocumentChunk

class ChunkRepository:
    """Repository for managing DocumentChunk records in MongoDB."""

    async def create_chunks(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        if not chunks:
            return []
        await DocumentChunk.insert_many(chunks)
        return chunks

    async def get_chunks_by_document(self, document_id: str) -> List[DocumentChunk]:
        return await DocumentChunk.find({"document_id": document_id}).sort("+chunk_index").to_list()

    async def get_chunks_by_ids(self, chunk_ids: List[str]) -> List[DocumentChunk]:
        """Fetches DocumentChunk models matching list of ID strings."""
        from bson import ObjectId
        valid_ids = []
        for cid in chunk_ids:
            try:
                valid_ids.append(ObjectId(cid))
            except Exception:
                pass
        if not valid_ids:
            return []
        return await DocumentChunk.find({"_id": {"$in": valid_ids}}).to_list()
