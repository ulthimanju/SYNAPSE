from typing import Generic, TypeVar
from pydantic import BaseModel, Field
from .common import ErrorDetails

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    """Generic API Success Response Envelope."""
    success: bool = Field(default=True, description="Indicates whether the request succeeded")
    message: str | None = Field(default=None, description="Optional human-readable success message")
    data: T | None = Field(default=None, description="Response payload data")
    request_id: str | None = Field(default=None, description="Unique correlation ID for tracing")

class ErrorResponse(BaseModel):
    """Standardized Error Response Envelope."""
    success: bool = Field(default=False, description="Always false for error responses")
    error: ErrorDetails = Field(..., description="Error detail payload")
    request_id: str | None = Field(default=None, description="Unique correlation ID for tracing")
