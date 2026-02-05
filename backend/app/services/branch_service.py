"""
Branch service with business logic.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models import Branch
from app.repositories import BranchRepository
from app.schemas.branch import BranchResponse, BranchWithChildren


class BranchService:
    """Service layer for Branch business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = BranchRepository(db)
        self.db = db

    async def validate_hierarchy(
        self, 
        is_headquarters: bool, 
        parent_branch_id: Optional[int],
        branch_id: Optional[int] = None
    ) -> None:
        """
        Validate branch hierarchy rules.
        
        Rules:
        - Headquarters cannot have a parent
        - Non-headquarters can optionally have a parent
        - Parent must exist and be a headquarters
        - No circular references
        """
        if is_headquarters and parent_branch_id:
            raise HTTPException(
                status_code=400,
                detail="Headquarters branch cannot have a parent"
            )
        
        if parent_branch_id:
            parent = await self.repository.get_by_id(parent_branch_id)
            if not parent:
                raise HTTPException(
                    status_code=404,
                    detail=f"Parent branch with id {parent_branch_id} not found"
                )
            
            if not parent.is_headquarters:
                raise HTTPException(
                    status_code=400,
                    detail="Parent branch must be a headquarters"
                )
            
            # Prevent self-reference
            if branch_id and parent_branch_id == branch_id:
                raise HTTPException(
                    status_code=400,
                    detail="Branch cannot be its own parent"
                )

    async def get_all_branches(self, include_hierarchy: bool = False) -> List[Branch]:
        """Get all branches, optionally with hierarchy loaded."""
        if include_hierarchy:
            return await self.repository.get_all_with_hierarchy()
        return await self.repository.get_all()

    async def get_branch(self, branch_id: int) -> Optional[Branch]:
        """Get a branch by ID."""
        return await self.repository.get_by_id(branch_id)

    async def get_branch_with_children(self, branch_id: int) -> Optional[Branch]:
        """Get a branch with its children loaded."""
        return await self.repository.get_with_children(branch_id)

    async def get_branch_by_name(self, name: str) -> Optional[Branch]:
        """Get a branch by name."""
        return await self.repository.get_by_name(name)

    async def get_headquarters(self) -> Optional[Branch]:
        """Get the headquarters branch."""
        return await self.repository.get_headquarters()

    async def get_children(self, branch_id: int) -> List[Branch]:
        """Get all children of a branch."""
        branch = await self.repository.get_with_children(branch_id)
        if not branch:
            return []
        return list(branch.children)

    async def get_branch_ids_for_filter(
        self, 
        branch_id: int, 
        include_children: bool = True
    ) -> List[int]:
        """Get branch IDs for filtering purposes."""
        return await self.repository.get_branch_ids_for_filter(branch_id, include_children)

    async def create_branch(
        self, 
        name: str, 
        is_headquarters: bool = False,
        parent_branch_id: Optional[int] = None
    ) -> Branch:
        """Create a new branch."""
        # Validate hierarchy
        await self.validate_hierarchy(is_headquarters, parent_branch_id)
        
        # Ensure only one headquarters
        if is_headquarters:
            hq = await self.repository.get_headquarters()
            if hq:
                raise HTTPException(
                    status_code=400,
                    detail="Headquarters branch already exists"
                )

        branch = Branch(
            name=name, 
            is_headquarters=is_headquarters,
            parent_branch_id=parent_branch_id
        )
        await self.repository.create(branch)
        await self.repository.commit()
        return branch

    async def update_branch(
        self, 
        branch_id: int, 
        name: Optional[str] = None, 
        is_headquarters: Optional[bool] = None,
        parent_branch_id: Optional[int] = None
    ) -> Optional[Branch]:
        """Update a branch."""
        branch = await self.repository.get_by_id(branch_id)
        if not branch:
            return None

        # Determine final values for validation
        final_is_hq = is_headquarters if is_headquarters is not None else branch.is_headquarters
        final_parent_id = parent_branch_id if parent_branch_id is not None else branch.parent_branch_id
        
        # Validate hierarchy
        await self.validate_hierarchy(final_is_hq, final_parent_id, branch_id)

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if is_headquarters is not None:
            if is_headquarters:
                hq = await self.repository.get_headquarters()
                if hq and hq.id != branch_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Headquarters branch already exists"
                    )
            update_data["is_headquarters"] = is_headquarters
        if parent_branch_id is not None:
            update_data["parent_branch_id"] = parent_branch_id

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
            raise HTTPException(
                status_code=400,
                detail="Cannot delete headquarters branch"
            )
        
        # Check if branch has children
        children_ids = await self.repository.get_children_ids(branch_id)
        if children_ids:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete branch with children. Remove or reassign children first."
            )

        await self.repository.delete(branch_id)
        await self.repository.commit()
        return True

    def _build_branch_response(self, branch: Branch) -> BranchResponse:
        """Build BranchResponse with computed fields."""
        return BranchResponse(
            id=branch.id,
            name=branch.name,
            is_headquarters=branch.is_headquarters,
            parent_branch_id=branch.parent_branch_id,
            parent_name=branch.parent.name if branch.parent else None,
            children_count=len(branch.children) if hasattr(branch, 'children') else 0,
            created_at=branch.created_at,
            updated_at=branch.updated_at
        )
