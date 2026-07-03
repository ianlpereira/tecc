"""
PaymentMethod repository for CRUD operations.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.payment_method import PaymentMethod
from app.repositories.base import BaseRepository


class PaymentMethodRepository(BaseRepository[PaymentMethod]):
    """Repository for PaymentMethod model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, PaymentMethod)

    async def get_all(self) -> List[PaymentMethod]:
        """Retrieve all non-deleted payment methods ordered alphabetically by name."""
        result = await self.db.execute(
            select(PaymentMethod)
            .where(PaymentMethod.deleted_at == None)  # noqa: E711
            .order_by(PaymentMethod.name)
        )
        return result.scalars().all()

    async def get_by_name(self, name: str) -> Optional[PaymentMethod]:
        """Get non-deleted payment method by name."""
        result = await self.db.execute(
            select(PaymentMethod).where(
                PaymentMethod.name == name,
                PaymentMethod.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def get_active(self) -> List[PaymentMethod]:
        """Get all active (non-deleted) payment methods."""
        result = await self.db.execute(
            select(PaymentMethod).where(
                PaymentMethod.is_active == True,  # noqa: E712
                PaymentMethod.deleted_at == None,  # noqa: E711
            ).order_by(PaymentMethod.name)
        )
        return list(result.scalars().all())
