"""
Vehicle router with CRUD endpoints and associated bills.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.schemas.bill import BillCreate, BillResponse
from app.services.vehicle_service import VehicleService
from app.services.bill_service import BillService

router = APIRouter(prefix="/api/v1/vehicles", tags=["vehicles"])


@router.get("/", response_model=List[VehicleResponse])
async def list_vehicles(db: AsyncSession = Depends(get_db)):
    """List all vehicles."""
    service = VehicleService(db)
    return await service.get_all_vehicles()


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    """Get a vehicle by ID."""
    service = VehicleService(db)
    vehicle = await service.get_vehicle(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")
    return vehicle


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(schema: VehicleCreate, db: AsyncSession = Depends(get_db)):
    """Create a new vehicle."""
    service = VehicleService(db)
    return await service.create_vehicle(
        plate=schema.plate,
        brand=schema.brand,
        model=schema.model,
        branch_id=schema.branch_id,
        year=schema.year,
        notes=schema.notes,
    )


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    schema: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a vehicle."""
    service = VehicleService(db)
    return await service.update_vehicle(
        vehicle_id,
        **schema.model_dump(exclude_none=True),
    )


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a vehicle."""
    service = VehicleService(db)
    await service.delete_vehicle(vehicle_id)


@router.get("/{vehicle_id}/bills", response_model=List[BillResponse])
async def get_vehicle_bills(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    """Get all bills associated with a vehicle."""
    v_service = VehicleService(db)
    vehicle = await v_service.get_vehicle(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")
    b_service = BillService(db)
    return await b_service.get_bills_by_vehicle(vehicle_id)


@router.post("/{vehicle_id}/bills", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle_bill(
    vehicle_id: int,
    schema: BillCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a bill directly associated with a vehicle."""
    v_service = VehicleService(db)
    vehicle = await v_service.get_vehicle(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")
    b_service = BillService(db)
    try:
        return await b_service.create_bill(
            branch_id=schema.branch_id,
            vendor_id=schema.vendor_id,
            category_id=schema.category_id,
            description=schema.description,
            amount=schema.amount,
            due_date=schema.due_date,
            invoice_number=schema.invoice_number,
            notes=schema.notes,
            is_recurring=schema.is_recurring,
            recurrence_interval_days=schema.recurrence_interval_days,
            recurrence_occurrences=schema.recurrence_occurrences,
            recurrence_day_of_month=schema.recurrence_day_of_month,
            vehicle_id=vehicle_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
