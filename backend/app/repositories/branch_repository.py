"""
Branch repository for CRUD operations on branches.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Branch
from app.repositories.base import BaseRepository


class BranchRepository(BaseRepository[Branch]):
    """Repository for Branch model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Branch)

    async def get_by_name(self, name: str) -> Optional[Branch]:
        """Get branch by name."""
        result = await self.db.execute(
            select(Branch).where(Branch.name == name)
        )
        return result.scalar_one_or_none()

    async def get_headquarters(self) -> Optional[Branch]:
        """Get the headquarters branch."""
        result = await self.db.execute(
            select(Branch).where(Branch.is_headquarters == True)
        )
        return result.scalar_one_or_none()
