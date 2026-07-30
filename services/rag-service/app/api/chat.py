from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, status, Response
from shared.schemas import APIResponse
from ..services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Singleton Workspace Chat"])

def get_chat_service() -> ChatService:
    return ChatService()

@router.post("", response_model=APIResponse[dict])
async def process_chat_turn(
    payload: dict,
    service: ChatService = Depends(get_chat_service),
) -> APIResponse[dict]:
    """Processes a user question, retrieves relevant vector chunks, generates answer via Gemini 2.5 Flash, and stores messages."""
    workspace_id = payload.get("workspace_id")
    query = payload.get("query", "")
    if not workspace_id or not query:
        return APIResponse(success=False, message="workspace_id and query are required.", data={})

    result = await service.process_chat(workspace_id=workspace_id, query=query)
    return APIResponse(message="Chat turn processed successfully.", data=result)

@router.get("/history", response_model=APIResponse[List[dict]])
async def get_chat_history(
    workspace_id: str = Query(..., description="Target Workspace ID"),
    service: ChatService = Depends(get_chat_service),
) -> APIResponse[List[dict]]:
    """Retrieves conversation message history for the workspace."""
    history = await service.get_history(workspace_id=workspace_id)
    return APIResponse(message="Chat history retrieved.", data=history)

@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_history(
    workspace_id: str = Query(..., description="Target Workspace ID"),
    service: ChatService = Depends(get_chat_service),
):
    """Deletes all messages for the workspace conversation while keeping the conversation document intact."""
    await service.clear_history(workspace_id=workspace_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
