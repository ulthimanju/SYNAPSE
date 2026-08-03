import asyncio
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Path, UploadFile, Request, status
from fastapi.responses import StreamingResponse
from shared.schemas import APIResponse
from shared.auth import get_current_user, AuthenticatedUser
from shared.exceptions import BadRequestException
from ..services.document_service import DocumentService
from ..schemas.document import DocumentRead

router = APIRouter(tags=["Documents"])

def get_document_service() -> DocumentService:
    return DocumentService()

def _get_auth_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("authorization")
    if auth_header:
        return auth_header
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return f"Bearer {cookie_token}"
    return None

# ── SSE: Real-time document status stream ─────────────────────────────────────
# IMPORTANT: This route MUST be declared BEFORE the generic GET /workspaces/{workspace_id}/documents
# route, otherwise FastAPI will match 'stream' as a document ID path parameter.
@router.get("/workspaces/{workspace_id}/documents/stream")
async def stream_workspace_document_status(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """SSE endpoint — streams document status change events for a workspace in real-time.
    On connect: sends a 'snapshot' event with all current documents.
    On each status change: sends a 'status' event with the updated document fields.
    Keepalive comment sent every 20 seconds to prevent proxy timeouts.
    """
    from shared.cache.redis_client import redis_cache_manager

    async def event_generator():
        # 1. Send initial snapshot of all documents in this workspace
        try:
            service = DocumentService()
            docs = await service.list_workspace_documents(workspace_id)
            snapshot_data = json.dumps(
                [d.model_dump() if hasattr(d, "model_dump") else d.dict() for d in docs],
                default=str,
            )
            yield f"event: snapshot\ndata: {snapshot_data}\n\n"
        except Exception as exc:
            yield f"event: error\ndata: {{\"error\": \"snapshot_failed\", \"detail\": \"{str(exc)}\"}}\n\n"

        # 2. Subscribe to Redis pub/sub channel for this workspace
        channel = f"doc_status:{workspace_id}"
        try:
            redis_client = await redis_cache_manager.get_client()
            # Create a separate pubsub connection (decode_responses=True is set on pool)
            pubsub = redis_client.pubsub()
            await pubsub.subscribe(channel)

            try:
                while True:
                    try:
                        message = await asyncio.wait_for(
                            pubsub.get_message(ignore_subscribe_messages=True),
                            timeout=20.0,
                        )
                        if message and message.get("type") == "message":
                            data = message["data"]
                            if isinstance(data, bytes):
                                data = data.decode("utf-8")
                            yield f"event: status\ndata: {data}\n\n"
                        else:
                            # Keepalive comment — keeps connection alive through proxies
                            yield ": keepalive\n\n"
                    except asyncio.TimeoutError:
                        yield ": keepalive\n\n"
            finally:
                await pubsub.unsubscribe(channel)
                await pubsub.aclose()
        except Exception as exc:
            import logging
            logging.getLogger(__name__).error(f"SSE stream error for workspace {workspace_id}: {exc}")
            yield f"event: error\ndata: {{\"error\": \"stream_failed\"}}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # Disable nginx buffering
            "Connection": "keep-alive",
        },
    )



def get_document_service() -> DocumentService:
    return DocumentService()

def _get_auth_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("authorization")
    if auth_header:
        return auth_header
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return f"Bearer {cookie_token}"
    return None

@router.post(
    "/workspaces/{workspace_id}/documents",
    response_model=APIResponse[DocumentRead],
    status_code=status.HTTP_201_CREATED
)
async def upload_workspace_document(
    request: Request,
    workspace_id: str = Path(..., description="Target Workspace ID"),
    file: UploadFile = File(..., description="Uploaded file payload"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> APIResponse[DocumentRead]:
    """Uploads file to Google Drive storage and records document metadata."""
    file_bytes = await file.read()
    filename = file.filename or "uploaded_file"
    content_type = file.content_type or "application/octet-stream"

    auth_token = _get_auth_token(request)
    result = await service.upload_document(
        workspace_id=workspace_id,
        uploaded_by=current_user.user_id,
        filename=filename,
        content_type=content_type,
        file_bytes=file_bytes,
        auth_token=auth_token
    )
    return APIResponse(message="Document uploaded successfully.", data=result)

@router.get("/workspaces/{workspace_id}/documents", response_model=APIResponse[List[DocumentRead]])
async def list_workspace_documents(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> APIResponse[List[DocumentRead]]:
    """Lists document metadata for a specific workspace."""
    result = await service.list_workspace_documents(workspace_id=workspace_id)
    return APIResponse(message="Workspace documents retrieved.", data=result)

@router.delete("/documents/{document_id}", response_model=APIResponse[dict])
async def delete_document(
    request: Request,
    document_id: str = Path(..., description="Document ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> APIResponse[dict]:
    """Deletes a document metadata record and removes file from Google Drive."""
    auth_token = _get_auth_token(request)
    await service.delete_document(document_id=document_id, user_id=current_user.user_id, auth_token=auth_token)
    return APIResponse(message="Document deleted successfully.", data={"id": document_id})

@router.post("/workspaces/{workspace_id}/documents/{document_id}/retry", response_model=APIResponse[DocumentRead])
async def retry_workspace_document_processing(
    request: Request,
    workspace_id: str = Path(..., description="Workspace ID"),
    document_id: str = Path(..., description="Document ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> APIResponse[DocumentRead]:
    """Restarts background parsing, chunking, and embedding pipeline for a failed document."""
    auth_token = _get_auth_token(request)
    result = await service.retry_document_processing(
        document_id=document_id,
        workspace_id=workspace_id,
        user_id=current_user.user_id,
        auth_token=auth_token
    )
    return APIResponse(message="Document processing pipeline restarted.", data=result)

@router.post("/documents/{document_id}/retry", response_model=APIResponse[DocumentRead])
async def retry_document_processing(
    request: Request,
    document_id: str = Path(..., description="Document ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> APIResponse[DocumentRead]:
    """Restarts background parsing, chunking, and embedding pipeline for a failed document."""
    auth_token = _get_auth_token(request)
    result = await service.retry_document_processing(
        document_id=document_id,
        workspace_id="",
        user_id=current_user.user_id,
        auth_token=auth_token
    )
    return APIResponse(message="Document processing pipeline restarted.", data=result)

@router.get("/internal/workspaces/{workspace_id}/parsed-documents", response_model=APIResponse[List[dict]])
async def get_internal_parsed_documents(
    workspace_id: str = Path(..., description="Workspace ID"),
) -> APIResponse[List[dict]]:
    """Internal REST endpoint exposing parsed Markdown documents for trusted microservices."""
    from ..services.parser_service import ParserService
    parser_service = ParserService()
    docs = await parser_service.get_parsed_documents_by_workspace(workspace_id)
    return APIResponse(message="Internal parsed documents retrieved.", data=docs)

@router.post("/internal/chunks/by-ids", response_model=APIResponse[List[dict]])
async def get_internal_chunks_by_ids(
    payload: dict,
) -> APIResponse[List[dict]]:
    """Internal REST endpoint fetching document chunk text contents and metadata for chunk IDs."""
    chunk_ids = payload.get("chunk_ids", [])
    from ..repositories.chunk_repository import ChunkRepository
    repo = ChunkRepository()
    chunks = await repo.get_chunks_by_ids(chunk_ids)
    
    from ..models.document import Document
    from bson import ObjectId
    
    doc_ids = list({c.document_id for c in chunks if c.document_id})
    doc_map = {}
    if doc_ids:
        valid_obj_ids = []
        for did in doc_ids:
            try:
                valid_obj_ids.append(ObjectId(did))
            except Exception:
                pass
        if valid_obj_ids:
            parent_docs = await Document.find({"_id": {"$in": valid_obj_ids}}).to_list()
            doc_map = {str(d.id): d.filename for d in parent_docs}
    
    data = []
    for c in chunks:
        doc_name = doc_map.get(c.document_id, "Document")
        data.append({
            "chunk_id": str(c.id),
            "document_id": c.document_id,
            "filename": doc_name,
            "content": c.content,
            "metadata": c.metadata or {},
        })
    return APIResponse(message="Internal chunk contents retrieved.", data=data)
