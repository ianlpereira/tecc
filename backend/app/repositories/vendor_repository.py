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

    async def get_by_name(self, name: str) -> Optional[Vendor]:
        """Get vendor by name."""
        result = await self.db.execute(
            select(Vendor).where(Vendor.name == name)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Vendor]:
        """Get vendor by email."""
        result = await self.db.execute(
            select(Vendor).where(Vendor.email == email)
        )
        return result.scalar_one_or_none()
