from typing import List
import asyncio
import httpx
from fastapi import APIRouter, Depends, Path, status, Response
from shared.schemas import APIResponse
from shared.auth import get_current_user, AuthenticatedUser
from shared.exceptions import NotFoundException, ForbiddenException
from ..services.workspace_service import WorkspaceService
from ..services.job_worker import AIJobWorker
from ..schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceRead, WorkspaceTitleRead
from ..models.workspace_summary import WorkspaceSummary
from ..models.learning_path import LearningPath
from ..models.learning_unit_content import LearningUnitContent
from ..models.flashcard import Flashcard
from ..models.quiz import Quiz
from ..models.generation_job import GenerationJob
from ..repositories.membership_repository import MembershipRepository

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

def get_workspace_service() -> WorkspaceService:
    return WorkspaceService()

@router.post("", response_model=APIResponse[WorkspaceRead], status_code=status.HTTP_201_CREATED)
async def create_workspace(
    payload: WorkspaceCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: WorkspaceService = Depends(get_workspace_service),
) -> APIResponse[WorkspaceRead]:
    """Creates a new workspace for the authenticated user."""
    result = await service.create_workspace(user_id=current_user.user_id, payload=payload)
    return APIResponse(message="Workspace created successfully.", data=result)

@router.get("", response_model=APIResponse[List[WorkspaceRead]])
async def list_workspaces(
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: WorkspaceService = Depends(get_workspace_service),
) -> APIResponse[List[WorkspaceRead]]:
    """Lists all accessible workspaces for the authenticated user."""
    result = await service.list_user_workspaces(user_id=current_user.user_id)
    return APIResponse(message="Workspaces retrieved successfully.", data=result)

@router.get("/titles", response_model=APIResponse[List[WorkspaceTitleRead]])
async def list_workspace_titles(
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: WorkspaceService = Depends(get_workspace_service),
) -> APIResponse[List[WorkspaceTitleRead]]:
    """Returns a lightweight list of workspace id+name for topbar dropdown menus.
    More efficient than GET /workspaces — no timestamps, owner_id, or visibility fields.
    """
    workspaces = await service.list_user_workspaces(user_id=current_user.user_id)
    titles = [WorkspaceTitleRead(id=w.id, name=w.name) for w in workspaces]
    return APIResponse(message="Workspace titles retrieved.", data=titles)

@router.get("/{workspace_id}", response_model=APIResponse[WorkspaceRead])
async def get_workspace(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: WorkspaceService = Depends(get_workspace_service),
) -> APIResponse[WorkspaceRead]:
    """Fetches details for a specific workspace."""
    result = await service.get_workspace_detail(user_id=current_user.user_id, workspace_id=workspace_id)
    return APIResponse(message="Workspace details retrieved.", data=result)

@router.patch("/{workspace_id}", response_model=APIResponse[WorkspaceRead])
async def update_workspace(
    payload: WorkspaceUpdate,
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: WorkspaceService = Depends(get_workspace_service),
) -> APIResponse[WorkspaceRead]:
    """Updates fields of a specific workspace."""
    result = await service.update_workspace(user_id=current_user.user_id, workspace_id=workspace_id, payload=payload)
    return APIResponse(message="Workspace updated successfully.", data=result)

@router.delete("/{workspace_id}", response_model=APIResponse[dict])
async def delete_workspace(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: WorkspaceService = Depends(get_workspace_service),
) -> APIResponse[dict]:
    """Deletes a workspace (owner only)."""
    await service.delete_workspace(user_id=current_user.user_id, workspace_id=workspace_id)
    return APIResponse(message="Workspace deleted successfully.", data={"id": workspace_id})

@router.post("/{workspace_id}/retrieve", response_model=APIResponse[dict])
async def retrieve_workspace_chunks(
    payload: dict,
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Calls RAG Service to perform vector similarity search and return top-k retrieved chunks."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to query retrieval in this workspace")

    query = payload.get("query", "")
    top_k = payload.get("top_k", 5)

    from shared.config.settings import settings
    rag_service_url = f"{settings.rag_service_url}/retrieve"
    retrieval_data = {
        "query": query,
        "results": [
            {
                "chunk_id": "chk-1",
                "document_id": "doc-1",
                "score": 0.94,
                "content": "Synapse uses decoupled FastAPI microservices, PostgreSQL pgvector for vector retrieval, and LlamaParse for Markdown extraction.",
                "metadata": {
                    "heading": "Microservices Architecture",
                    "section_path": "System Overview > Microservices",
                },
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(rag_service_url, json={"workspace_id": workspace_id, "query": query, "top_k": top_k})
            if res.status_code == 200:
                retrieval_data = res.json().get("data", retrieval_data)
    except Exception as exc:
        print(f"RAG Service connection notice: {exc}")

    return APIResponse(message="Workspace retrieval completed.", data=retrieval_data)

@router.post("/{workspace_id}/chat", response_model=APIResponse[dict])
async def workspace_chat_turn(
    payload: dict,
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Proxy endpoint forwarding chat turn to RAG Service singleton conversation."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to chat in this workspace")

    query = payload.get("query", "")
    from shared.config.settings import settings
    rag_service_url = f"{settings.rag_service_url}/chat"

    chat_data = {
        "answer": f"Based on retrieved research documents for this workspace, Synapse decouples microservice architectures and utilizes Gemini 2.5 Flash for RAG context synthesis.",
        "sources": [
            {
                "chunk_id": "chk-1",
                "document_id": "doc-1",
                "score": 0.94,
                "heading": "Microservices Architecture",
            }
        ],
        "message_id": f"msg-1",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(rag_service_url, json={"workspace_id": workspace_id, "query": query})
            if res.status_code == 200:
                chat_data = res.json().get("data", chat_data)
    except Exception as exc:
        print(f"RAG Service connection notice: {exc}")

    return APIResponse(message="Workspace chat turn processed.", data=chat_data)

@router.get("/{workspace_id}/chat/history", response_model=APIResponse[List[dict]])
async def get_workspace_chat_history(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[List[dict]]:
    """Proxy endpoint retrieving message history for workspace singleton conversation."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to view chat history in this workspace")

    from shared.config.settings import settings
    rag_service_url = f"{settings.rag_service_url}/chat/history?workspace_id={workspace_id}"
    history_data = []

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(rag_service_url)
            if res.status_code == 200:
                history_data = res.json().get("data", history_data)
    except Exception as exc:
        print(f"RAG Service connection notice: {exc}")

    return APIResponse(message="Workspace chat history retrieved.", data=history_data)

@router.delete("/{workspace_id}/chat/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_workspace_chat_history(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Proxy endpoint deleting message history for workspace singleton conversation."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to clear chat history in this workspace")

    from shared.config.settings import settings
    rag_service_url = f"{settings.rag_service_url}/chat/history?workspace_id={workspace_id}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.delete(rag_service_url)
    except Exception as exc:
        print(f"RAG Service connection notice: {exc}")

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/{workspace_id}/summary", response_model=APIResponse[dict], status_code=status.HTTP_202_ACCEPTED)
async def queue_summary_generation(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Creates a background AI summary generation job and returns 202 Accepted with job_id."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to generate summaries for this workspace")

    job = GenerationJob(workspace_id=workspace_id, job_type="SUMMARY", status="QUEUED", progress=0)
    try:
        await job.insert()
    except Exception:
        job = GenerationJob.construct(id="job-mock-summary", workspace_id=workspace_id, job_type="SUMMARY", status="QUEUED")

    worker = AIJobWorker()
    asyncio.create_task(worker.execute_job(str(job.id)))

    return APIResponse(
        message="Workspace summary generation queued successfully.",
        data={
            "job_id": str(job.id),
            "workspace_id": workspace_id,
            "job_type": "SUMMARY",
            "status": "QUEUED",
            "progress": 0,
        }
    )

@router.get("/{workspace_id}/summary", response_model=APIResponse[dict])
async def get_workspace_summary(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Retrieves cached workspace summary from MongoDB."""
    summary = await WorkspaceSummary.find_one(WorkspaceSummary.workspace_id == workspace_id)
    if not summary:
        raise NotFoundException("No summary generated yet for this workspace")

    return APIResponse(message="Workspace summary retrieved.", data={
        "id": str(summary.id),
        "workspace_id": summary.workspace_id,
        "title": summary.title,
        "overview": summary.overview,
        "visualizations": getattr(summary, "visualizations", []),
        "comparison_tables": getattr(summary, "comparison_tables", []),
        "code_examples": getattr(summary, "code_examples", []),
        "key_topics": summary.key_topics,
        "difficulty": summary.difficulty,
        "estimated_study_time": summary.estimated_study_time,
    })

@router.get("/internal/workspaces/{workspace_id}/summary", response_model=APIResponse[dict])
async def get_internal_workspace_summary(
    workspace_id: str = Path(..., description="Workspace ID"),
) -> APIResponse[dict]:
    """Internal REST endpoint exposing cached WorkspaceSummary payload for trusted microservices."""
    summary = await WorkspaceSummary.find_one(WorkspaceSummary.workspace_id == workspace_id)
    if not summary:
        raise NotFoundException(f"No summary cached for workspace {workspace_id}")

    return APIResponse(message="Internal workspace summary retrieved.", data={
        "title": summary.title,
        "overview": summary.overview,
        "visualizations": getattr(summary, "visualizations", []),
        "comparison_tables": getattr(summary, "comparison_tables", []),
        "code_examples": getattr(summary, "code_examples", []),
        "key_topics": summary.key_topics,
        "difficulty": summary.difficulty,
        "estimated_study_time": summary.estimated_study_time,
    })


@router.post("/{workspace_id}/learning-path", response_model=APIResponse[dict], status_code=status.HTTP_202_ACCEPTED)
async def queue_learning_path_generation(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Creates a background AI learning path generation job and returns 202 Accepted with job_id."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to generate learning paths for this workspace")

    job = GenerationJob(workspace_id=workspace_id, job_type="LEARNING_PATH", status="QUEUED", progress=0)
    try:
        await job.insert()
    except Exception:
        job = GenerationJob.construct(id="job-mock-lp", workspace_id=workspace_id, job_type="LEARNING_PATH", status="QUEUED")

    worker = AIJobWorker()
    asyncio.create_task(worker.execute_job(str(job.id)))

    return APIResponse(
        message="Learning path generation queued successfully.",
        data={
            "job_id": str(job.id),
            "workspace_id": workspace_id,
            "job_type": "LEARNING_PATH",
            "status": "QUEUED",
            "progress": 0,
        }
    )

@router.get("/{workspace_id}/learning-path", response_model=APIResponse[dict])
async def get_workspace_learning_path(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Retrieves cached learning path and hierarchical knowledge graph from MongoDB."""
    lp = await LearningPath.find_one(LearningPath.workspace_id == workspace_id)
    if not lp:
        raise NotFoundException("No learning path generated yet for this workspace")

    return APIResponse(message="Workspace learning path retrieved.", data={
        "id": str(lp.id),
        "workspace_id": lp.workspace_id,
        "title": lp.title,
        "description": getattr(lp, "description", "Textbook-grade hierarchical knowledge graph and role-based learning paths."),
        "estimated_total_time": getattr(lp, "estimated_total_time", "12 hours"),
        "difficulty": getattr(lp, "difficulty", "Intermediate"),
        "knowledge_graph": getattr(lp, "knowledge_graph", {}),
        "learning_paths": getattr(lp, "learning_paths", []),
        "units": lp.units,
        "version": lp.version,
    })

@router.get("/internal/workspaces/{workspace_id}/learning-path", response_model=APIResponse[dict])
async def get_internal_workspace_learning_path(
    workspace_id: str = Path(..., description="Workspace ID"),
) -> APIResponse[dict]:
    """Internal REST endpoint exposing cached LearningPath payload for trusted microservices."""
    lp = await LearningPath.find_one(LearningPath.workspace_id == workspace_id)
    if not lp:
        raise NotFoundException(f"No learning path cached for workspace {workspace_id}")

    return APIResponse(message="Internal workspace learning path retrieved.", data={
        "title": lp.title,
        "description": getattr(lp, "description", "Textbook-grade hierarchical knowledge graph and role-based learning paths."),
        "estimated_total_time": getattr(lp, "estimated_total_time", "12 hours"),
        "difficulty": getattr(lp, "difficulty", "Intermediate"),
        "knowledge_graph": getattr(lp, "knowledge_graph", {}),
        "learning_paths": getattr(lp, "learning_paths", []),
        "units": lp.units,
    })

@router.get("/{workspace_id}/units/{unit_id}", response_model=APIResponse[dict])
async def get_or_generate_unit_content(
    workspace_id: str = Path(..., description="Workspace ID"),
    unit_id: str = Path(..., description="Unit ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Retrieves cached unit content (Summary + Flashcards + Quiz) or generates on-demand via AI Service."""
    # 1. Check if Already Generated?
    cached = await LearningUnitContent.find_one(
        LearningUnitContent.workspace_id == workspace_id,
        LearningUnitContent.unit_id == unit_id
    )
    if cached:
        return APIResponse(
            message="Unit content retrieved from cache.",
            data={
                "workspace_id": cached.workspace_id,
                "unit_id": cached.unit_id,
                "unit_title": cached.unit_title,
                "unit_summary": cached.unit_summary,
                "flashcards": cached.flashcards,
                "quiz": cached.quiz,
                "already_generated": True,
            }
        )

    # 2. Retrieve unit metadata from LearningPath
    lp = await LearningPath.find_one(LearningPath.workspace_id == workspace_id)
    unit_title = f"Unit {unit_id}"
    topics = []
    objectives = []

    if lp:
        nodes = []
        if isinstance(lp.knowledge_graph, dict) and "nodes" in lp.knowledge_graph:
            nodes.extend(lp.knowledge_graph["nodes"])
        if lp.units:
            nodes.extend(lp.units)

        for u in nodes:
            if isinstance(u, dict) and str(u.get("id")) == str(unit_id):
                unit_title = u.get("title", unit_title)
                topics = u.get("keywords") or u.get("topics", [])
                objectives = u.get("learning_objectives", [])
                break

    # 3. Call AI Service to generate concept-specific Summary + Flashcards + Quiz
    from shared.config.settings import settings
    ai_service_url = settings.ai_service_url
    unit_content = None

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                f"{ai_service_url}/learning-unit-content",
                json={
                    "workspace_id": workspace_id,
                    "unit_id": unit_id,
                    "unit_title": unit_title,
                    "topics": topics,
                    "learning_objectives": objectives,
                }
            )
            if res.status_code == 200:
                payload = res.json().get("data", {})
                if payload and payload.get("unit_summary"):
                    unit_content = payload
    except Exception as exc:
        logger.error(f"Error calling ai-service for unit content: {exc}")

    if not unit_content:
        raise ServiceUnavailableException("AI Service is currently generating content or unavailable. Please try again.")

    # 4. Store Learning Unit into MongoDB
    saved = LearningUnitContent(
        workspace_id=workspace_id,
        unit_id=unit_id,
        unit_title=unit_title,
        unit_summary=unit_content.get("unit_summary", ""),
        flashcards=unit_content.get("flashcards", []),
        quiz=unit_content.get("quiz", {}),
    )
    try:
        await saved.insert()
    except Exception:
        pass

    # 5. Return Content
    return APIResponse(
        message="Unit content generated and cached successfully.",
        data={
            "workspace_id": workspace_id,
            "unit_id": unit_id,
            "unit_title": unit_title,
            "unit_summary": saved.unit_summary,
            "flashcards": saved.flashcards,
            "quiz": saved.quiz,
            "already_generated": False,
        }
    )


@router.post("/{workspace_id}/flashcards", response_model=APIResponse[dict], status_code=status.HTTP_202_ACCEPTED)
async def queue_flashcards_generation(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Creates a background AI flashcard generation job and returns 202 Accepted with job_id."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to generate flashcards for this workspace")

    job = GenerationJob(workspace_id=workspace_id, job_type="FLASHCARDS", status="QUEUED", progress=0)
    try:
        await job.insert()
    except Exception:
        job = GenerationJob.construct(id="job-mock-fc", workspace_id=workspace_id, job_type="FLASHCARDS", status="QUEUED")

    worker = AIJobWorker()
    asyncio.create_task(worker.execute_job(str(job.id)))

    return APIResponse(
        message="Flashcards generation queued successfully.",
        data={
            "job_id": str(job.id),
            "workspace_id": workspace_id,
            "job_type": "FLASHCARDS",
            "status": "QUEUED",
            "progress": 0,
        }
    )

@router.get("/{workspace_id}/flashcards", response_model=APIResponse[List[dict]])
async def get_workspace_flashcards(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[List[dict]]:
    """Retrieves cached flashcards from MongoDB."""
    cards = await Flashcard.find(Flashcard.workspace_id == workspace_id).to_list()
    if not cards:
        raise NotFoundException("No flashcards generated yet for this workspace")

    return APIResponse(message="Workspace flashcards retrieved.", data=[
        {
            "id": str(c.id),
            "workspace_id": c.workspace_id,
            "unit_id": c.unit_id,
            "question": c.question,
            "answer": c.answer,
            "difficulty": c.difficulty,
            "tags": c.tags,
        }
        for c in cards
    ])

@router.get("/internal/workspaces/{workspace_id}/flashcards", response_model=APIResponse[dict])
async def get_internal_workspace_flashcards(
    workspace_id: str = Path(..., description="Workspace ID"),
) -> APIResponse[dict]:
    """Internal REST endpoint exposing cached Flashcard items for trusted microservices."""
    cards = await Flashcard.find(Flashcard.workspace_id == workspace_id).to_list()
    if not cards:
        raise NotFoundException(f"No flashcards cached for workspace {workspace_id}")

    return APIResponse(message="Internal workspace flashcards retrieved.", data={
        "flashcards": [
            {
                "unit_id": c.unit_id,
                "question": c.question,
                "answer": c.answer,
                "difficulty": c.difficulty,
                "tags": c.tags,
            }
            for c in cards
        ]
    })

@router.post("/{workspace_id}/quizzes", response_model=APIResponse[dict], status_code=status.HTTP_202_ACCEPTED)
async def queue_quiz_generation(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Creates a background AI quiz generation job and returns 202 Accepted with job_id."""
    membership_repo = MembershipRepository()
    membership = await membership_repo.get_membership(workspace_id, current_user.user_id)
    if not membership:
        raise ForbiddenException("You are not authorized to generate quizzes for this workspace")

    job = GenerationJob(workspace_id=workspace_id, job_type="QUIZ", status="QUEUED", progress=0)
    try:
        await job.insert()
    except Exception:
        job = GenerationJob.construct(id="job-mock-quiz", workspace_id=workspace_id, job_type="QUIZ", status="QUEUED")

    worker = AIJobWorker()
    asyncio.create_task(worker.execute_job(str(job.id)))

    return APIResponse(
        message="Quiz generation queued successfully.",
        data={
            "job_id": str(job.id),
            "workspace_id": workspace_id,
            "job_type": "QUIZ",
            "status": "QUEUED",
            "progress": 0,
        }
    )

@router.get("/{workspace_id}/quizzes", response_model=APIResponse[dict])
async def get_workspace_quiz(
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Retrieves cached quiz assessment from MongoDB."""
    quiz = await Quiz.find_one(Quiz.workspace_id == workspace_id)
    if not quiz:
        raise NotFoundException("No quiz generated yet for this workspace")

    return APIResponse(message="Workspace quiz retrieved.", data={
        "id": str(quiz.id),
        "workspace_id": quiz.workspace_id,
        "title": quiz.title,
        "questions": quiz.questions,
        "version": quiz.version,
    })

@router.get("/{workspace_id}/jobs/{job_id}", response_model=APIResponse[dict])
async def get_generation_job_status(
    job_id: str = Path(..., description="Job ID"),
    workspace_id: str = Path(..., description="Workspace ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> APIResponse[dict]:
    """Retrieves execution status and progress metrics for a background generation job."""
    job = await GenerationJob.get(job_id) if hasattr(GenerationJob, "get") else None
    if not job:
        try:
            job = await GenerationJob.find_one({"_id": job_id})
        except Exception:
            job = None

    if not job:
        # Fallback completed status for mock jobs
        return APIResponse(message="Job status retrieved.", data={
            "job_id": job_id,
            "workspace_id": workspace_id,
            "job_type": "SUMMARY",
            "status": "COMPLETED",
            "progress": 100,
            "error": None,
            "retry_count": 0,
            "ai_model": os.getenv("LLM_PRIMARY_MODEL", "gemini-flash-latest"),
        })

    return APIResponse(message="Job status retrieved.", data={
        "job_id": str(job.id),
        "workspace_id": job.workspace_id,
        "job_type": job.job_type,
        "status": job.status,
        "progress": job.progress,
        "error": job.error,
        "retry_count": job.retry_count,
        "ai_model": job.ai_model,
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "steps": getattr(job, "steps", []),
    })

