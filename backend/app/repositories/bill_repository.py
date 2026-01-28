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
        """Get all bills for a branch."""
        result = await self.db.execute(
            select(Bill).where(Bill.branch_id == branch_id)
        )
        return result.scalars().all()

    async def get_by_vendor(self, vendor_id: int) -> List[Bill]:
        """Get all bills from a vendor."""
        result = await self.db.execute(
            select(Bill).where(Bill.vendor_id == vendor_id)
        )
        return result.scalars().all()

    async def get_by_status(self, status: BillStatus) -> List[Bill]:
        """Get all bills with a specific status."""
        result = await self.db.execute(
            select(Bill).where(Bill.status == status)
        )
        return result.scalars().all()

    async def get_pending_bills(self) -> List[Bill]:
        """Get all pending bills."""
        return await self.get_by_status(BillStatus.PENDING)

    async def get_by_invoice(self, invoice_number: str) -> Optional[Bill]:
        """Get bill by invoice number."""
        result = await self.db.execute(
            select(Bill).where(Bill.invoice_number == invoice_number)
        )
        return result.scalar_one_or_none()
