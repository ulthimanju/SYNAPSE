import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured logging of HTTP requests, status codes, and execution duration, including failed requests."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception:
            status_code = 500
            raise
        finally:
            request_id = getattr(request.state, "request_id", "UNKNOWN")
            duration_ms = getattr(request.state, "process_time_ms", 0.0)

            logger.info(
                f"[{request_id}] {request.method} {request.url.path} -> "
                f"Status {status_code} ({duration_ms:.2f}ms)"
            )
