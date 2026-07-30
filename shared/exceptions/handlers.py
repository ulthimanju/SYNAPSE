import logging
from typing import Optional
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .base import SynapseException

logger = logging.getLogger(__name__)

def _get_request_id(request: Request) -> Optional[str]:
    """Helper to extract request_id from request.state if available."""
    return getattr(request.state, "request_id", None)

async def synapse_exception_handler(request: Request, exc: SynapseException) -> JSONResponse:
    """Handles custom Synapse exceptions and returns standard JSON error structure."""
    req_id = _get_request_id(request)
    logger.warning(
        f"[{req_id or 'NO_REQ_ID'}] Handled SynapseException on {request.method} {request.url.path}: "
        f"[{exc.code}] {exc.message} (status: {exc.status_code})"
    )
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict(request_id=req_id))

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handles standard FastAPI/Starlette HTTPExceptions."""
    req_id = _get_request_id(request)
    logger.warning(
        f"[{req_id or 'NO_REQ_ID'}] Handled HTTPException on {request.method} {request.url.path}: {exc.detail} (status: {exc.status_code})"
    )
    content = {
        "success": False,
        "error": {
            "code": "HTTP_ERROR",
            "message": str(exc.detail),
            "details": None,
        },
        "request_id": req_id,
    }
    return JSONResponse(status_code=exc.status_code, content=content)

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handles FastAPI Pydantic request validation errors."""
    req_id = _get_request_id(request)
    logger.warning(f"[{req_id or 'NO_REQ_ID'}] Validation error on {request.method} {request.url.path}: {exc.errors()}")
    content = {
        "success": False,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Invalid request payload or parameters",
            "details": exc.errors(),
        },
        "request_id": req_id,
    }
    return JSONResponse(status_code=422, content=content)

async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Fallback handler for uncaught exceptions."""
    req_id = _get_request_id(request)
    logger.error(
        f"[{req_id or 'NO_REQ_ID'}] Unhandled exception on {request.method} {request.url.path}: {str(exc)}",
        exc_info=exc
    )
    content = {
        "success": False,
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An internal server error occurred",
            "details": None,
        },
        "request_id": req_id,
    }
    return JSONResponse(status_code=500, content=content)

def register_exception_handlers(app: FastAPI) -> None:
    """Registers all global exception handlers on a FastAPI application instance."""
    app.add_exception_handler(SynapseException, synapse_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
