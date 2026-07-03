"""
Vendor repository for CRUD operations on vendors.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Vendor
from app.repositories.base import BaseRepository


class VendorRepository(BaseRepository[Vendor]):
    """Repository for Vendor model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Vendor)

    async def get_all(self) -> List[Vendor]:
        """Retrieve all non-deleted vendors ordered alphabetically by name."""
        result = await self.db.execute(
            select(Vendor)
            .where(Vendor.deleted_at == None)  # noqa: E711
            .order_by(Vendor.name)
        )
        return result.scalars().all()

    async def get_by_name(self, name: str) -> Optional[Vendor]:
        """Get non-deleted vendor by name."""
        result = await self.db.execute(
            select(Vendor).where(
                Vendor.name == name,
                Vendor.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Vendor]:
        """Get non-deleted vendor by email. Returns None if email is empty or None."""
        if not email or not email.strip():
            return None
        result = await self.db.execute(
            select(Vendor).where(
                Vendor.email == email,
                Vendor.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()
