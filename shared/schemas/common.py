from typing import Any, Optional
from pydantic import BaseModel, Field

class ErrorDetails(BaseModel):
    """Standard error detail body format."""
    code: str = Field(..., description="Unique machine-readable error code")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[Any] = Field(default=None, description="Optional extra contextual error details")
