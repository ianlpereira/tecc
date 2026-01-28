"""
Branch service with business logic.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Branch
from app.repositories import BranchRepository


class BranchService:
    """Service layer for Branch business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = BranchRepository(db)
        self.db = db

    async def get_all_branches(self) -> List[Branch]:
        """Get all branches."""
        return await self.repository.get_all()

    async def get_branch(self, branch_id: int) -> Optional[Branch]:
        """Get a branch by ID."""
        return await self.repository.get_by_id(branch_id)

    async def get_branch_by_name(self, name: str) -> Optional[Branch]:
        """Get a branch by name."""
        return await self.repository.get_by_name(name)

    async def get_headquarters(self) -> Optional[Branch]:
        """Get the headquarters branch."""
        return await self.repository.get_headquarters()

    async def create_branch(
        self, name: str, is_headquarters: bool = False
    ) -> Branch:
        """Create a new branch."""
        # Ensure only one headquarters
        if is_headquarters:
            hq = await self.repository.get_headquarters()
            if hq:
                raise ValueError("Headquarters branch already exists")

        branch = Branch(name=name, is_headquarters=is_headquarters)
        await self.repository.create(branch)
        await self.repository.commit()
        return branch

    async def update_branch(
        self, branch_id: int, name: str = None, is_headquarters: bool = None
    ) -> Optional[Branch]:
        """Update a branch."""
        branch = await self.repository.get_by_id(branch_id)
        if not branch:
            return None

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if is_headquarters is not None:
            if is_headquarters:
                hq = await self.repository.get_headquarters()
                if hq and hq.id != branch_id:
                    raise ValueError("Headquarters branch already exists")
            update_data["is_headquarters"] = is_headquarters

        await self.repository.update(branch_id, update_data)
        await self.repository.commit()
        return await self.repository.get_by_id(branch_id)

    async def delete_branch(self, branch_id: int) -> bool:
        """Delete a branch."""
        branch = await self.repository.get_by_id(branch_id)
        if not branch:
            return False

        # Prevent deleting headquarters
        if branch.is_headquarters:
            raise ValueError("Cannot delete headquarters branch")

        await self.repository.delete(branch_id)
        await self.repository.commit()
        return True
