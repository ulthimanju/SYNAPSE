from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    """Standardized Service Health Check Response Model."""
    service: str = Field(..., description="Name of the reporting service")
    status: str = Field(default="healthy", description="Health status string (e.g. healthy, degraded, unhealthy)")
    version: str = Field(default="1.0.0", description="Service semver string")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Optional service diagnostic details")
