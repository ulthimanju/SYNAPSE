import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Middleware for measuring request processing time and adding X-Process-Time header."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000.0

        request.state.process_time_ms = duration_ms
        response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"
        return response
