from fastapi import Depends
from shared.exceptions import ForbiddenException
from .models import AuthenticatedUser
from .dependencies import get_current_user

async def require_admin(
    user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """FastAPI Dependency: Ensures current user has 'admin' role."""
    if "admin" not in user.roles:
        raise ForbiddenException("Action requires admin role permissions")
    return user

async def require_student(
    user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """FastAPI Dependency: Ensures current user has 'student' or 'admin' role."""
    allowed_roles = {"student", "admin"}
    if not any(role in allowed_roles for role in user.roles):
        raise ForbiddenException("Action requires student role permissions")
    return user
