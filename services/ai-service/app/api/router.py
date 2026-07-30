from fastapi import APIRouter
from .health import router as health_router
from .summary import router as summary_router
from .learning_path import router as learning_path_router
from .flashcards import router as flashcards_router
from .quizzes import router as quizzes_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(summary_router)
api_router.include_router(learning_path_router)
api_router.include_router(flashcards_router)
api_router.include_router(quizzes_router)
