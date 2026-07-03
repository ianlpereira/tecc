"""
PaymentMethod router with CRUD endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.payment_method import (
    PaymentMethodCreate,
    PaymentMethodUpdate,
    PaymentMethodResponse,
)
from app.services.payment_method_service import PaymentMethodService

router = APIRouter(prefix="/api/v1/payment-methods", tags=["payment-methods"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=List[PaymentMethodResponse])
async def list_payment_methods(db: AsyncSession = Depends(get_db)):
    """Get all payment methods."""
    service = PaymentMethodService(db)
    return await service.get_all()


@router.get("/active", response_model=List[PaymentMethodResponse])
async def list_active_payment_methods(db: AsyncSession = Depends(get_db)):
    """Get all active payment methods."""
    service = PaymentMethodService(db)
    return await service.get_active()


@router.get("/{payment_method_id}", response_model=PaymentMethodResponse)
async def get_payment_method(payment_method_id: int, db: AsyncSession = Depends(get_db)):
    """Get a payment method by ID."""
    service = PaymentMethodService(db)
    pm = await service.get_by_id(payment_method_id)
    if not pm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment method not found")
    return pm


@router.post("/", response_model=PaymentMethodResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_method(
    schema: PaymentMethodCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new payment method."""
    service = PaymentMethodService(db)
    try:
        return await service.create(schema.name, schema.is_active)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{payment_method_id}", response_model=PaymentMethodResponse)
async def update_payment_method(
    payment_method_id: int,
    schema: PaymentMethodUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a payment method."""
    service = PaymentMethodService(db)
    try:
        updated = await service.update(payment_method_id, schema.name, schema.is_active)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment method not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{payment_method_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_method(payment_method_id: int, db: AsyncSession = Depends(get_db)):
    """Soft-delete a payment method."""
    service = PaymentMethodService(db)
    deleted = await service.delete(payment_method_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment method not found")


@router.post("/seed", response_model=dict, status_code=status.HTTP_200_OK)
async def seed_payment_methods(db: AsyncSession = Depends(get_db)):
    """Seed initial payment methods (idempotent, only runs if none exist)."""
    service = PaymentMethodService(db)
    count = await service.seed_initial_data()
    return {"seeded": count, "message": f"{count} payment methods created" if count else "Already seeded"}
