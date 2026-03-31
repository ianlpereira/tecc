"""
Bill router with CRUD endpoints.
"""

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas import (
    BillCreate, BillUpdate, BillResponse,
    BillRecurrenceUpdate,
    BatchDeleteRequest, BatchMarkPaidRequest, BatchDeleteResponse, BatchMarkPaidResponse,
    DueTodaySummary,
    BillReportResponse,
)
from app.schemas.base import BaseSchema
from app.services import BillService
from app.models import BillStatus

router = APIRouter(prefix="/api/v1/bills", tags=["bills"], dependencies=[Depends(get_current_user)])


class MarkPaidRequest(BaseSchema):
    """Optional payload for marking a bill as paid."""

    payment_bank: str | None = None
    paid_at: date | None = None


# Static collection endpoints (must be before /{bill_id})

@router.get("/", response_model=List[BillResponse])
async def list_bills(
    branch_id: Optional[int] = Query(None, description="Filter by branch ID"),
    include_children: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    """Get all bills, optionally filtered by branch."""
    service = BillService(db)
    if branch_id:
        return await service.get_bills_by_branch(branch_id, include_children)
    return await service.get_all_bills()


@router.get("/branch/{branch_id}", response_model=List[BillResponse])
async def get_bills_by_branch(
    branch_id: int,
    include_children: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    service = BillService(db)
    return await service.get_bills_by_branch(branch_id, include_children)


@router.get("/vendor/{vendor_id}", response_model=List[BillResponse])
async def get_bills_by_vendor(vendor_id: int, db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    return await service.get_bills_by_vendor(vendor_id)


@router.get("/status/pending", response_model=List[BillResponse])
async def get_pending_bills(db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    return await service.get_pending_bills()


@router.get("/group/{group_id}", response_model=List[BillResponse])
async def get_bills_by_recurrence_group(group_id: str, db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    return await service.get_bills_by_recurrence_group(group_id)


# Epic 14: Batch actions

@router.post("/batch-delete", response_model=BatchDeleteResponse)
async def batch_delete_bills(body: BatchDeleteRequest, db: AsyncSession = Depends(get_db)):
    """Soft-delete multiple bills at once."""
    service = BillService(db)
    deleted = await service.batch_soft_delete(body.ids)
    return {"deleted": deleted}


@router.post("/batch-mark-paid", response_model=BatchMarkPaidResponse)
async def batch_mark_paid_bills(body: BatchMarkPaidRequest, db: AsyncSession = Depends(get_db)):
    """Mark multiple bills as paid. Skips already paid/cancelled."""
    service = BillService(db)
    result = await service.batch_mark_paid(body.ids, body.payment_bank, body.paid_at)
    return result


# Epic 15: Due-today summary

@router.get("/summary/due-today", response_model=DueTodaySummary)
async def get_due_today_summary(
    branch_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Return count and amounts of bills due today and overdue."""
    service = BillService(db)
    return await service.get_due_today_summary(branch_id)


# Epic 16: Reports

@router.get("/report", response_model=BillReportResponse)
async def get_report(
    due_date_from: Optional[date] = Query(None),
    due_date_to: Optional[date] = Query(None),
    month: Optional[str] = Query(None, description="Format: YYYY-MM"),
    branch_ids: Optional[str] = Query(None),
    vendor_ids: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    vehicle_ids: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    payment_bank: Optional[str] = Query(None),
    payment_method_id: Optional[int] = Query(None),  # Epic 17
    db: AsyncSession = Depends(get_db),
):
    """Get report with optional filters and totals."""
    def parse_ids(s):
        return [int(x) for x in s.split(",") if x.strip()] if s else None

    service = BillService(db)
    return await service.get_report(
        date_from=due_date_from,
        date_to=due_date_to,
        month=month,
        branch_ids=parse_ids(branch_ids),
        vendor_ids=parse_ids(vendor_ids),
        category_ids=[category_id] if category_id else None,
        vehicle_ids=parse_ids(vehicle_ids),
        statuses=[status] if status else None,
        payment_banks=[payment_bank] if payment_bank else None,
        payment_method_ids=[payment_method_id] if payment_method_id else None,
    )


# Single bill endpoints (/{bill_id} and sub-paths)

@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: int, db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    bill = await service.get_bill(bill_id)
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return bill


@router.post("/", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(schema: BillCreate, db: AsyncSession = Depends(get_db)):
    """Create a new bill."""
    service = BillService(db)
    try:
        return await service.create_bill(
            schema.branch_id,
            schema.vendor_id,
            schema.category_id,
            schema.description,
            schema.amount,
            schema.due_date,
            schema.invoice_number,
            schema.notes,
            schema.is_recurring,
            schema.recurrence_interval_days,
            schema.recurrence_occurrences,
            schema.recurrence_day_of_month,
            schema.recurrence_dates,
            schema.vehicle_id,
            schema.payment_method_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{bill_id}", response_model=BillResponse)
async def update_bill(bill_id: int, schema: BillUpdate, db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    try:
        updated = await service.update_bill(
            bill_id,
            schema.description,
            schema.amount,
            schema.due_date,
            schema.status,
            schema.invoice_number,
            schema.notes,
            schema.payment_bank,
            schema.paid_at,
            schema.vendor_id,
            schema.category_id,
            schema.branch_id,
            schema.vehicle_id,
            schema.payment_method_id,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Epic 13: Recurrence edit scope

@router.put("/{bill_id}/recurrence", response_model=BillResponse)
async def update_bill_recurrence(
    bill_id: int,
    schema: BillRecurrenceUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a recurring bill with scope."""
    if schema.scope not in ("this", "this_and_next", "all"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scope must be 'this', 'this_and_next' or 'all'",
        )
    service = BillService(db)
    try:
        updated = await service.update_bill_recurrence(
            bill_id,
            schema.scope,
            schema.description,
            schema.amount,
            schema.due_date,
            schema.invoice_number,
            schema.notes,
            schema.vendor_id,
            schema.category_id,
            schema.branch_id,
            schema.vehicle_id,
            schema.payment_method_id,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{bill_id}/mark-paid", response_model=BillResponse)
async def mark_bill_paid(
    bill_id: int,
    payload: MarkPaidRequest = MarkPaidRequest(),
    db: AsyncSession = Depends(get_db),
):
    service = BillService(db)
    updated = await service.mark_bill_paid(bill_id, payload.payment_bank, payload.paid_at)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return updated


@router.post("/{bill_id}/mark-approved", response_model=BillResponse)
async def mark_bill_approved(bill_id: int, db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    updated = await service.mark_bill_approved(bill_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return updated


@router.post("/{bill_id}/cancel", response_model=BillResponse)
async def cancel_bill(bill_id: int, db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    updated = await service.cancel_bill(bill_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return updated


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bill(bill_id: int, db: AsyncSession = Depends(get_db)):
    service = BillService(db)
    deleted = await service.delete_bill(bill_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
