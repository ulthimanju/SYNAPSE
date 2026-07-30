from typing import Any, Optional
from .base import SynapseException

class BusinessRuleViolationException(SynapseException):
    """Raised when a business domain rule or invariant is violated."""
    def __init__(self, message: str = "Business rule violation", details: Optional[Any] = None):
        super().__init__(message=message, code="BUSINESS_RULE_VIOLATION", status_code=400, details=details)

class ResourceAlreadyExistsException(SynapseException):
    """Raised when attempting to create a resource that already exists."""
    def __init__(self, message: str = "Resource already exists", details: Optional[Any] = None):
        super().__init__(message=message, code="RESOURCE_ALREADY_EXISTS", status_code=409, details=details)

class ResourceNotFoundException(SynapseException):
    """Raised when a requested domain entity or resource cannot be found."""
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message=message, code="RESOURCE_NOT_FOUND", status_code=404, details=details)

class InvalidOperationException(SynapseException):
    """Raised when an operation cannot be performed in the current domain state."""
    def __init__(self, message: str = "Invalid operation", details: Optional[Any] = None):
        super().__init__(message=message, code="INVALID_OPERATION", status_code=400, details=details)

class InsufficientPermissionsException(SynapseException):
    """Raised when a user lacks required permissions for a domain action."""
    def __init__(self, message: str = "Insufficient permissions", details: Optional[Any] = None):
        super().__init__(message=message, code="INSUFFICIENT_PERMISSIONS", status_code=403, details=details)
