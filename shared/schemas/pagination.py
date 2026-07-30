from typing import Generic, List, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginationMeta(BaseModel):
    """Pagination metadata model."""
    page: int = Field(..., ge=1, description="Current page number (1-indexed)")
    page_size: int = Field(..., ge=1, description="Number of items per page")
    total: int = Field(..., ge=0, description="Total number of items available")
    pages: int = Field(..., ge=0, description="Total number of pages")

class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized Paginated API Response Envelope."""
    success: bool = Field(default=True, description="Indicates whether the request succeeded")
    message: str | None = Field(default=None, description="Optional success message")
    data: List[T] = Field(default_factory=list, description="List of paginated items")
    pagination: PaginationMeta = Field(..., description="Pagination metadata")
    request_id: str | None = Field(default=None, description="Unique correlation ID for tracing")
