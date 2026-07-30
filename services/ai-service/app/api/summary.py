from fastapi import APIRouter, Depends, status
from shared.schemas import APIResponse
from ..services.workspace_summary_service import WorkspaceSummaryService
from ..schemas.summary import WorkspaceSummaryRequest, WorkspaceSummaryResponse

router = APIRouter(tags=["AI Summary"])

def get_summary_service() -> WorkspaceSummaryService:
    return WorkspaceSummaryService()

@router.post("/workspace-summary", response_model=APIResponse[WorkspaceSummaryResponse])
async def generate_workspace_summary(
    payload: WorkspaceSummaryRequest,
    service: WorkspaceSummaryService = Depends(get_summary_service),
) -> APIResponse[WorkspaceSummaryResponse]:
    """Generates structured executive summary for a workspace using Gemini 2.5 Flash."""
    result = await service.generate_summary(workspace_id=payload.workspace_id)
    return APIResponse(message="Workspace summary generated successfully.", data=result)
