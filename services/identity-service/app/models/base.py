import uuid
from sqlalchemy import UUID
from sqlalchemy.orm import Mapped, mapped_column
from shared.database import Base, TimestampMixin

class BaseIdentityModel(Base, TimestampMixin):
    """Base class for Identity Service models with UUID primary keys and timestamps."""
    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
