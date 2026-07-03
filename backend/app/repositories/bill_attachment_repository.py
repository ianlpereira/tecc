"""
BillAttachment repository for CRUD operations.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import BillAttachment
from app.repositories.base import BaseRepository


class BillAttachmentRepository(BaseRepository[BillAttachment]):
    """Repository for BillAttachment model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, BillAttachment)

    async def get_by_bill(self, bill_id: int) -> List[BillAttachment]:
        """Get all attachments for a bill."""
        result = await self.db.execute(
            select(BillAttachment)
            .where(BillAttachment.bill_id == bill_id)
            .order_by(BillAttachment.id)
        )
        return result.scalars().all()

    async def get_by_bill_and_id(self, bill_id: int, attachment_id: int) -> Optional[BillAttachment]:
        """Get a specific attachment belonging to a bill."""
        result = await self.db.execute(
            select(BillAttachment).where(
                BillAttachment.bill_id == bill_id,
                BillAttachment.id == attachment_id,
            )
        )
        return result.scalar_one_or_none()

    async def count_by_bill(self, bill_id: int) -> int:
        """Count attachments for a bill."""
        attachments = await self.get_by_bill(bill_id)
        return len(attachments)
