"""
Vehicle repository for CRUD operations.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.vehicle import Vehicle
from app.repositories.base import BaseRepository


class VehicleRepository(BaseRepository[Vehicle]):
    """Repository for Vehicle model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Vehicle)

    async def get_all(self) -> List[Vehicle]:
        """Retrieve all non-deleted vehicles ordered alphabetically by plate."""
        result = await self.db.execute(
            select(Vehicle)
            .where(Vehicle.deleted_at == None)  # noqa: E711
            .order_by(Vehicle.plate)
        )
        return result.scalars().all()

    async def get_by_branch(self, branch_id: int) -> List[Vehicle]:
        """Get all non-deleted vehicles for a branch."""
        result = await self.db.execute(
            select(Vehicle).where(
                Vehicle.branch_id == branch_id,
                Vehicle.deleted_at == None,  # noqa: E711
            )
            .order_by(Vehicle.plate)
        )
        return result.scalars().all()

    async def get_by_plate(self, plate: str) -> Optional[Vehicle]:
        """Get non-deleted vehicle by plate number."""
        result = await self.db.execute(
            select(Vehicle).where(
                Vehicle.plate == plate,
                Vehicle.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

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
        vehicle = Vehicle(
            plate=plate,
            brand=brand,
            model=model,
            branch_id=branch_id,
            year=year,
            notes=notes,
        )
        return await self.create(vehicle)
