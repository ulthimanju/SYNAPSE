from typing import Any, Optional
from .base import SynapseException

class BadRequestException(SynapseException):
    """400 Bad Request."""
    def __init__(self, message: str = "Bad request", details: Optional[Any] = None):
        super().__init__(message=message, code="BAD_REQUEST", status_code=400, details=details)

class UnauthorizedException(SynapseException):
    """401 Unauthorized."""
    def __init__(self, message: str = "Unauthorized access", details: Optional[Any] = None):
        super().__init__(message=message, code="UNAUTHORIZED", status_code=401, details=details)

class ForbiddenException(SynapseException):
    """403 Forbidden."""
    def __init__(self, message: str = "Access forbidden", details: Optional[Any] = None):
        super().__init__(message=message, code="FORBIDDEN", status_code=403, details=details)

class NotFoundException(SynapseException):
    """404 Not Found."""
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message=message, code="NOT_FOUND", status_code=404, details=details)

class ConflictException(SynapseException):
    """409 Conflict."""
    def __init__(self, message: str = "Resource state conflict", details: Optional[Any] = None):
        super().__init__(message=message, code="CONFLICT", status_code=409, details=details)

class UnprocessableEntityException(SynapseException):
    """422 Unprocessable Entity."""
    def __init__(self, message: str = "Unprocessable entity", details: Optional[Any] = None):
        super().__init__(message=message, code="UNPROCESSABLE_ENTITY", status_code=422, details=details)

class InternalServerErrorException(SynapseException):
    """500 Internal Server Error."""
    def __init__(self, message: str = "Internal server error", details: Optional[Any] = None):
        super().__init__(message=message, code="INTERNAL_SERVER_ERROR", status_code=500, details=details)

class ServiceUnavailableException(SynapseException):
    """503 Service Unavailable."""
    def __init__(self, message: str = "Service temporarily unavailable", details: Optional[Any] = None):
        super().__init__(message=message, code="SERVICE_UNAVAILABLE", status_code=503, details=details)
