"""
Category schemas for Pydantic validation.
"""

from app.schemas.base import BaseSchema, TimestampedSchema


class CategoryBase(BaseSchema):
    """Base category schema."""

    name: str
    description: str | None = None


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""

    pass


class CategoryUpdate(BaseSchema):
    """Schema for updating a category."""

    name: str | None = None
    description: str | None = None


class CategoryResponse(TimestampedSchema):
    """Schema for category response."""

    id: int
    name: str
    description: str | None = None
