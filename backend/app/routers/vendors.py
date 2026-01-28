"""
Vendor router with CRUD endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import VendorCreate, VendorUpdate, VendorResponse
from app.services import VendorService

router = APIRouter(prefix="/api/v1/vendors", tags=["vendors"])


@router.get("/", response_model=List[VendorResponse])
async def list_vendors(db: AsyncSession = Depends(get_db)):
    """Get all vendors."""
    service = VendorService(db)
    return await service.get_all_vendors()


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: int, db: AsyncSession = Depends(get_db)):
    """Get a vendor by ID."""
    service = VendorService(db)
    vendor = await service.get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    return vendor


@router.post("/", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    schema: VendorCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new vendor."""
    service = VendorService(db)
    try:
        return await service.create_vendor(
            schema.name,
            schema.email,
            schema.phone,
            schema.address,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: int,
    schema: VendorUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a vendor."""
    service = VendorService(db)
    try:
        updated = await service.update_vendor(
            vendor_id,
            schema.name,
            schema.email,
            schema.phone,
            schema.address,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a vendor."""
    service = VendorService(db)
    deleted = await service.delete_vendor(vendor_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
