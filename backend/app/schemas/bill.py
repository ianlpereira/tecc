"""
Bill schemas for Pydantic validation.
"""

from datetime import date
from app.schemas.base import BaseSchema, TimestampedSchema
from app.models import BillStatus


class BillBase(BaseSchema):
    """Base bill schema."""

    branch_id: int
    vendor_id: int
    category_id: int
    description: str
    amount: float
    due_date: date
    invoice_number: str | None = None
    notes: str | None = None


class BillCreate(BillBase):
    """Schema for creating a bill."""

    is_recurring: bool = False
    recurrence_interval_days: int | None = None
    recurrence_occurrences: int | None = None


class BillUpdate(BaseSchema):
    """Schema for updating a bill."""

    description: str | None = None
    amount: float | None = None
    due_date: date | None = None
    status: BillStatus | None = None
    notes: str | None = None


class BillResponse(TimestampedSchema):
    """Schema for bill response."""

    id: int
    branch_id: int
    vendor_id: int
    category_id: int
    description: str
    amount: float
    due_date: date
    status: BillStatus
    invoice_number: str | None = None
    notes: str | None = None
    is_recurring: bool = False
    recurrence_group_id: str | None = None
    recurrence_interval_days: int | None = None
    recurrence_total: int | None = None
    recurrence_index: int | None = None
