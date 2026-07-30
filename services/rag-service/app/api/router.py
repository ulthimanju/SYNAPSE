from fastapi import APIRouter
from .health import router as health_router
from .retrieval import router as retrieval_router
from .chat import router as chat_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(retrieval_router)
api_router.include_router(chat_router)
