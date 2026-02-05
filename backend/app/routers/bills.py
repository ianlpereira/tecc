"""
Bill router with CRUD endpoints.
"""

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import BillCreate, BillUpdate, BillResponse
from app.services import BillService
from app.models import BillStatus

router = APIRouter(prefix="/api/v1/bills", tags=["bills"])


@router.get("/", response_model=List[BillResponse])
async def list_bills(
    branch_id: Optional[int] = Query(None, description="Filter by branch ID"),
    include_children: bool = Query(False, description="Include child branches when filtering by branch"),
    db: AsyncSession = Depends(get_db)
):
    """Get all bills, optionally filtered by branch (with hierarchy support)."""
    service = BillService(db)
    
    if branch_id:
        return await service.get_bills_by_branch(branch_id, include_children)
    
    return await service.get_all_bills()


@router.get("/branch/{branch_id}", response_model=List[BillResponse])
async def get_bills_by_branch(
    branch_id: int, 
    include_children: bool = Query(False, description="Include child branches"),
    db: AsyncSession = Depends(get_db)
):
    """Get all bills for a branch, optionally including child branches."""
    service = BillService(db)
    return await service.get_bills_by_branch(branch_id, include_children)


@router.get("/vendor/{vendor_id}", response_model=List[BillResponse])
async def get_bills_by_vendor(vendor_id: int, db: AsyncSession = Depends(get_db)):
    """Get all bills from a vendor."""
    service = BillService(db)
    return await service.get_bills_by_vendor(vendor_id)


@router.get("/status/pending", response_model=List[BillResponse])
async def get_pending_bills(db: AsyncSession = Depends(get_db)):
    """Get all pending bills."""
    service = BillService(db)
    return await service.get_pending_bills()


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: int, db: AsyncSession = Depends(get_db)):
    """Get a bill by ID."""
    service = BillService(db)
    bill = await service.get_bill(bill_id)
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return bill


@router.post("/", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(
    schema: BillCreate,
    db: AsyncSession = Depends(get_db),
):
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
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{bill_id}", response_model=BillResponse)
async def update_bill(
    bill_id: int,
    schema: BillUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a bill."""
    service = BillService(db)
    try:
        updated = await service.update_bill(
            bill_id,
            schema.description,
            schema.amount,
            schema.due_date,
            schema.status,
            schema.notes,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{bill_id}/mark-paid", response_model=BillResponse)
async def mark_bill_paid(bill_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a bill as paid."""
    service = BillService(db)
    updated = await service.mark_bill_paid(bill_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return updated


@router.post("/{bill_id}/mark-approved", response_model=BillResponse)
async def mark_bill_approved(bill_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a bill as approved."""
    service = BillService(db)
    updated = await service.mark_bill_approved(bill_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return updated


@router.post("/{bill_id}/cancel", response_model=BillResponse)
async def cancel_bill(bill_id: int, db: AsyncSession = Depends(get_db)):
    """Cancel a bill."""
    service = BillService(db)
    updated = await service.cancel_bill(bill_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return updated


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bill(
    bill_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a bill."""
    service = BillService(db)
    deleted = await service.delete_bill(bill_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
