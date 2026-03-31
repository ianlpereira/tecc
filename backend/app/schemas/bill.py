"""
Bill schemas for Pydantic validation.
"""

from datetime import date
from typing import List, Optional
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
    recurrence_day_of_month: int | None = None
    recurrence_dates: Optional[List[date]] = None  # Epic 12: manual dates mode
    vehicle_id: int | None = None
    payment_method_id: int | None = None  # Epic 17: linked payment method


class BillUpdate(BaseSchema):
    """Schema for updating a bill."""

    description: str | None = None
    amount: float | None = None
    due_date: date | None = None
    status: BillStatus | None = None
    invoice_number: str | None = None
    notes: str | None = None
    payment_bank: str | None = None
    paid_at: date | None = None
    vendor_id: int | None = None
    category_id: int | None = None
    branch_id: int | None = None
    vehicle_id: int | None = None
    payment_method_id: int | None = None  # Epic 17


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
    recurrence_day_of_month: int | None = None
    payment_bank: str | None = None
    paid_at: date | None = None
    vehicle_id: int | None = None
    attachments_count: int = 0
    payment_method_id: int | None = None       # Epic 17
    payment_method_name: str | None = None     # Epic 17 (resolved via join)


# ── Epic 13: Recurrence edit scope ───────────────────────────────────────────

class BillRecurrenceUpdate(BaseSchema):
    """Schema for updating a recurring bill with scope selection."""

    scope: str  # "this" | "this_and_next" | "all"
    description: str | None = None
    amount: float | None = None
    due_date: date | None = None
    invoice_number: str | None = None
    notes: str | None = None
    vendor_id: int | None = None
    category_id: int | None = None
    branch_id: int | None = None
    vehicle_id: int | None = None
    payment_method_id: int | None = None  # Epic 17


# ── Epic 14: Batch actions ────────────────────────────────────────────────────

class BatchDeleteRequest(BaseSchema):
    """Request body for batch delete."""

    ids: List[int]


class BatchMarkPaidRequest(BaseSchema):
    """Request body for batch mark-paid."""

    ids: List[int]
    payment_bank: str | None = None
    paid_at: date | None = None


class BatchDeleteResponse(BaseSchema):
    """Response for batch delete."""

    deleted: int


class BatchMarkPaidResponse(BaseSchema):
    """Response for batch mark-paid."""

    updated: int
    skipped: int


# ── Epic 15: Due-today summary ────────────────────────────────────────────────

class DueTodaySummary(BaseSchema):
    """Summary of bills due today and overdue."""

    count: int
    total_amount: float
    overdue_count: int
    overdue_amount: float
    due_today_count: int
    due_today_amount: float


# ── Epic 16: Report ───────────────────────────────────────────────────────────

class BillReportRow(BaseSchema):
    """Single row in a bill report with joined names."""

    id: int
    description: str
    vendor_name: str | None = None
    category_name: str | None = None
    branch_name: str | None = None
    vehicle_plate: str | None = None
    amount: float
    due_date: date
    status: BillStatus
    payment_bank: str | None = None
    paid_at: date | None = None
    payment_method_name: str | None = None  # Epic 17


class BillReportSummary(BaseSchema):
    """Totals for a bill report."""

    total_amount: float
    paid_amount: float
    pending_amount: float
    count: int


class BillReportResponse(BaseSchema):
    """Full report response."""

    rows: List[BillReportRow]
    summary: BillReportSummary
