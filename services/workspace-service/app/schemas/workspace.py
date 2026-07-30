from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class WorkspaceCreate(BaseModel):
    """Schema for creating a workspace."""
    name: str = Field(..., max_length=255, description="Workspace name")
    visibility: str = Field(default="private", description="Workspace visibility: 'private' or 'shared'")

class WorkspaceUpdate(BaseModel):
    """Schema for updating a workspace."""
    name: Optional[str] = Field(default=None, max_length=255)
    visibility: Optional[str] = Field(default=None)
    is_archived: Optional[bool] = Field(default=None)

class WorkspaceRead(BaseModel):
    """Schema for reading workspace payload."""
    id: str
    name: str
    owner_id: str
    visibility: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime

class WorkspaceTitleRead(BaseModel):
    """Lightweight workspace projection — only id and name for dropdown menus."""
    id: str
    name: str
