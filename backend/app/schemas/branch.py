"""
Branch schemas for Pydantic validation.
"""

from typing import Optional, List
from app.schemas.base import BaseSchema, TimestampedSchema


class BranchBase(BaseSchema):
    """Base branch schema."""

    name: str
    is_headquarters: bool = False
    parent_branch_id: Optional[int] = None


class BranchCreate(BranchBase):
    """Schema for creating a branch."""

    pass


class BranchUpdate(BaseSchema):
    """Schema for updating a branch."""

    name: str | None = None
    is_headquarters: bool | None = None
    parent_branch_id: int | None = None


class BranchResponse(TimestampedSchema):
    """Schema for branch response."""

    id: int
    name: str
    is_headquarters: bool
    parent_branch_id: Optional[int] = None
    parent_name: Optional[str] = None
    children_count: int = 0


class BranchWithChildren(BranchResponse):
    """Schema for branch with children details."""

    children: List["BranchResponse"] = []
