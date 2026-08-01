from fastapi import FastAPI
from .request_id import RequestIDMiddleware
from .timing import RequestTimingMiddleware
from .logging import RequestLoggingMiddleware
from .security import SecurityHeadersMiddleware

def register_middlewares(app: FastAPI) -> None:
    """Registers standard core middleware stack in explicit order:
    1. Request ID Middleware
    2. Timing Middleware
    3. Logging Middleware
    4. Security Headers Middleware
    """
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RequestTimingMiddleware)
    app.add_middleware(RequestIDMiddleware)

def register_middleware(app: FastAPI) -> None:
    """Alias for register_middlewares."""
    register_middlewares(app)

__all__ = [
    "RequestIDMiddleware",
    "RequestTimingMiddleware",
    "RequestLoggingMiddleware",
    "register_middlewares",
    "register_middleware",
]
