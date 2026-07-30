from .base import SynapseException
from .business import (
    BusinessRuleViolationException,
    ResourceAlreadyExistsException,
    ResourceNotFoundException,
    InvalidOperationException,
    InsufficientPermissionsException,
)
from .http import (
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
    UnprocessableEntityException,
    InternalServerErrorException,
    ServiceUnavailableException,
)
from .handlers import (
    register_exception_handlers,
    synapse_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)

__all__ = [
    "SynapseException",
    "BusinessRuleViolationException",
    "ResourceAlreadyExistsException",
    "ResourceNotFoundException",
    "InvalidOperationException",
    "InsufficientPermissionsException",
    "BadRequestException",
    "UnauthorizedException",
    "ForbiddenException",
    "NotFoundException",
    "ConflictException",
    "UnprocessableEntityException",
    "InternalServerErrorException",
    "ServiceUnavailableException",
    "register_exception_handlers",
    "synapse_exception_handler",
    "http_exception_handler",
    "validation_exception_handler",
    "unhandled_exception_handler",
]
