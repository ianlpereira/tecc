"""
Branch repository for CRUD operations on branches.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
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

    async def get_with_children(self, branch_id: int) -> Optional[Branch]:
        """Get branch with all its children loaded."""
        result = await self.db.execute(
            select(Branch)
            .options(selectinload(Branch.children))
            .where(Branch.id == branch_id)
        )
        return result.scalar_one_or_none()

    async def get_children_ids(self, branch_id: int) -> List[int]:
        """Get all children IDs of a branch."""
        result = await self.db.execute(
            select(Branch.id).where(Branch.parent_branch_id == branch_id)
        )
        return list(result.scalars().all())

    async def get_branch_ids_for_filter(self, branch_id: int, include_children: bool = True) -> List[int]:
        """
        Get branch IDs for filtering (branch + optionally its children).
        
        Args:
            branch_id: The main branch ID
            include_children: Whether to include children branches
            
        Returns:
            List of branch IDs to filter by
        """
        ids = [branch_id]
        
        if include_children:
            children_ids = await self.get_children_ids(branch_id)
            ids.extend(children_ids)
        
        return ids

    async def get_all_with_hierarchy(self) -> List[Branch]:
        """Get all branches with parent/children relationships loaded."""
        result = await self.db.execute(
            select(Branch)
            .options(selectinload(Branch.parent))
            .options(selectinload(Branch.children))
        )
        return list(result.scalars().all())
