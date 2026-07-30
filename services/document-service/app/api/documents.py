from typing import List
from fastapi import APIRouter, Depends, File, Path, UploadFile, Request, status
from shared.schemas import APIResponse
from shared.auth import get_current_user, AuthenticatedUser
from ..services.document_service import DocumentService
from ..schemas.document import DocumentRead

router = APIRouter(tags=["Documents"])

def get_document_service() -> DocumentService:
    return DocumentService()

@router.post(
    "/workspaces/{workspace_id}/documents",
    response_model=APIResponse[DocumentRead],
    status_code=status.HTTP_201_CREATED
)
async def upload_workspace_document(
    request: Request,
    workspace_id: str = Path(..., description="Target Workspace ID"),
    file: UploadFile = File(..., description="File payload to upload"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> APIResponse[DocumentRead]:
    """Uploads file to MinIO object storage and records document metadata."""
    file_bytes = await file.read()
    auth_token = request.headers.get("authorization")
    result = await service.upload_document(
        workspace_id=workspace_id,
        uploaded_by=current_user.user_id,
        filename=file.filename or "file",
        content_type=file.content_type or "application/octet-stream",
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
    auth_token = request.headers.get("authorization")
    await service.delete_document(document_id=document_id, user_id=current_user.user_id, auth_token=auth_token)
    return APIResponse(message="Document deleted successfully.", data={"id": document_id})

@router.post("/workspaces/{workspace_id}/documents/{document_id}/retry", response_model=APIResponse[DocumentRead])
@router.post("/documents/{document_id}/retry", response_model=APIResponse[DocumentRead])
async def retry_document_processing(
    request: Request,
    document_id: str = Path(..., description="Document ID"),
    workspace_id: str = Path(default="", description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> APIResponse[DocumentRead]:
    """Restarts background parsing, chunking, and embedding pipeline for a failed document."""
    auth_token = request.headers.get("authorization")
    result = await service.retry_document_processing(
        document_id=document_id,
        workspace_id=workspace_id,
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
    
    data = [
        {
            "chunk_id": str(c.id),
            "document_id": c.document_id,
            "content": c.content,
            "metadata": c.metadata or {},
        }
        for c in chunks
    ]
    return APIResponse(message="Internal chunk contents retrieved.", data=data)
