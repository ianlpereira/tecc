"""
Bill repository for CRUD operations on bills.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Bill, BillStatus
from app.repositories.base import BaseRepository


class BillRepository(BaseRepository[Bill]):
    """Repository for Bill model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Bill)

    async def get_by_branch(self, branch_id: int) -> List[Bill]:
        """Get all non-deleted bills for a branch."""
        result = await self.db.execute(
            select(Bill).where(
                Bill.branch_id == branch_id,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalars().all()

    async def get_by_branches(self, branch_ids: List[int]) -> List[Bill]:
        """Get all non-deleted bills for multiple branches (for hierarchy filtering)."""
        result = await self.db.execute(
            select(Bill).where(
                Bill.branch_id.in_(branch_ids),
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalars().all()

    async def get_by_vendor(self, vendor_id: int) -> List[Bill]:
        """Get all non-deleted bills from a vendor."""
        result = await self.db.execute(
            select(Bill).where(
                Bill.vendor_id == vendor_id,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalars().all()

    async def get_by_status(self, status: BillStatus) -> List[Bill]:
        """Get all non-deleted bills with a specific status."""
        result = await self.db.execute(
            select(Bill).where(
                Bill.status == status,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalars().all()

    async def get_pending_bills(self) -> List[Bill]:
        """Get all pending bills."""
        return await self.get_by_status(BillStatus.PENDING)

    async def get_by_invoice(self, invoice_number: str) -> Optional[Bill]:
        """Get non-deleted bill by invoice number."""
        result = await self.db.execute(
            select(Bill).where(
                Bill.invoice_number == invoice_number,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def get_by_recurrence_group(self, group_id: str) -> List[Bill]:
        """Get all non-deleted bills belonging to a recurrence group, ordered by index."""
        result = await self.db.execute(
            select(Bill)
            .where(
                Bill.recurrence_group_id == group_id,
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.recurrence_index)
        )
        return result.scalars().all()

    async def get_by_vehicle(self, vehicle_id: int) -> List[Bill]:
        """Get all non-deleted bills associated with a vehicle."""
        result = await self.db.execute(
            select(Bill).where(
                Bill.vehicle_id == vehicle_id,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalars().all()

    async def get_by_category(self, category_id: int) -> List[Bill]:
        """Get all non-deleted bills for a category."""
        result = await self.db.execute(
            select(Bill).where(
                Bill.category_id == category_id,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalars().all()
