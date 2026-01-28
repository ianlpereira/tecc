"""
Base model for all SQLAlchemy models with common fields.
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, func
from app.core.database import Base


class BaseModel(Base):
    """Base model with common audit fields."""

    __abstract__ = True

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        default=datetime.utcnow,
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        default=datetime.utcnow,
    )
