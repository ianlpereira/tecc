"""
Category repository for CRUD operations on categories.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """Repository for Category model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Category)

    async def get_by_name(self, name: str) -> Optional[Category]:
        """Get category by name."""
        result = await self.db.execute(
            select(Category).where(Category.name == name)
        )
        return result.scalar_one_or_none()
