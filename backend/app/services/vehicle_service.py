"""
Vehicle service with business logic.
"""

from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository


class VehicleService:
    """Service layer for Vehicle business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = VehicleRepository(db)

    async def get_all_vehicles(self) -> List[Vehicle]:
        """Get all vehicles."""
        return await self.repository.get_all()

    async def get_vehicle(self, vehicle_id: int) -> Optional[Vehicle]:
        """Get a vehicle by ID."""
        return await self.repository.get_by_id(vehicle_id)

    async def get_vehicles_by_branch(self, branch_id: int) -> List[Vehicle]:
        """Get all vehicles for a branch."""
        return await self.repository.get_by_branch(branch_id)

    async def create_vehicle(
        self,
        plate: str,
        brand: str,
        model: str,
        branch_id: int,
        year: int | None = None,
        notes: str | None = None,
    ) -> Vehicle:
        """Create a new vehicle."""
        existing = await self.repository.get_by_plate(plate)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Veículo com placa '{plate}' já cadastrado.",
            )
        vehicle = Vehicle(
            plate=plate,
            brand=brand,
            model=model,
            branch_id=branch_id,
            year=year,
            notes=notes,
        )
        await self.repository.create(vehicle)
        await self.repository.commit()
        return vehicle

    async def update_vehicle(self, vehicle_id: int, **kwargs) -> Vehicle:
        """Update a vehicle."""
        vehicle = await self.repository.get_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Veículo não encontrado.",
            )
        # Check plate uniqueness if plate is being changed
        new_plate = kwargs.get("plate")
        if new_plate and new_plate != vehicle.plate:
            existing = await self.repository.get_by_plate(new_plate)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Veículo com placa '{new_plate}' já cadastrado.",
                )
        return await self.repository.update(vehicle_id, {k: v for k, v in kwargs.items() if v is not None})

    async def delete_vehicle(self, vehicle_id: int) -> None:
        """Delete a vehicle."""
        vehicle = await self.repository.get_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Veículo não encontrado.",
            )
        await self.repository.delete(vehicle_id)
