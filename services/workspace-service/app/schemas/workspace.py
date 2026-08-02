from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class WorkspaceCreate(BaseModel):
    """Schema for creating a workspace."""
    name: str = Field(..., max_length=255, description="Workspace name")
    description: Optional[str] = Field(default=None, description="Workspace description")
    is_shared: bool = Field(default=False, description="Shared workspace boolean flag (True = shared, False = private)")

class WorkspaceUpdate(BaseModel):
    """Schema for updating a workspace."""
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None)
    is_shared: Optional[bool] = Field(default=None)
    is_archived: Optional[bool] = Field(default=None)

class CollaboratorInvite(BaseModel):
    """Schema for inviting a collaborator to a workspace."""
    email: str = Field(..., description="Email of the user to invite")
    role: str = Field(default="collaborator", description="Role: 'collaborator' or 'owner'")

class CollaboratorUpdate(BaseModel):
    """Schema for updating a collaborator's role."""
    role: str = Field(..., description="Role: 'owner' or 'collaborator'")

class CollaboratorRead(BaseModel):
    """Schema for reading collaborator info."""
    id: str
    workspace_id: str
    user_id: str
    email: Optional[str] = None
    role: str
    joined_at: datetime

class WorkspaceRead(BaseModel):
    """Schema for reading workspace payload."""
    id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    is_shared: bool = False
    is_archived: bool = False
    role: str = "owner"
    is_owner: bool = True
    can_edit: bool = True
    created_at: datetime
    updated_at: datetime

class WorkspaceTitleRead(BaseModel):
    """Lightweight workspace projection — includes id, name, is_owner, and role for dropdown menus."""
    id: str
    name: str
    is_owner: bool = True
    role: str = "owner"
