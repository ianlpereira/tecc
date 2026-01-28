"""
Branch schemas for Pydantic validation.
"""

from app.schemas.base import BaseSchema, TimestampedSchema


class BranchBase(BaseSchema):
    """Base branch schema."""

    name: str
    is_headquarters: bool = False


class BranchCreate(BranchBase):
    """Schema for creating a branch."""

    pass


class BranchUpdate(BaseSchema):
    """Schema for updating a branch."""

    name: str | None = None
    is_headquarters: bool | None = None


class BranchResponse(TimestampedSchema):
    """Schema for branch response."""

    id: int
    name: str
    is_headquarters: bool
