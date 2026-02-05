"""
Branch router with CRUD endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import BranchCreate, BranchUpdate, BranchResponse
from app.schemas.branch import BranchWithChildren
from app.services import BranchService

router = APIRouter(prefix="/api/v1/branches", tags=["branches"])


@router.get("/", response_model=List[BranchResponse])
async def list_branches(
    include_hierarchy: bool = Query(False, description="Include parent/children relationships"),
    db: AsyncSession = Depends(get_db)
):
    """Get all branches, optionally with hierarchy."""
    service = BranchService(db)
    branches = await service.get_all_branches(include_hierarchy=include_hierarchy)
    
    if include_hierarchy:
        # Build response with parent_name and children_count
        return [service._build_branch_response(b) for b in branches]
    
    return branches


@router.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get a branch by ID."""
    service = BranchService(db)
    branch = await service.get_branch(branch_id)
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return branch


@router.get("/{branch_id}/children", response_model=List[BranchResponse])
async def get_branch_children(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all children branches of a branch."""
    service = BranchService(db)
    branch = await service.get_branch(branch_id)
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    
    children = await service.get_children(branch_id)
    return children


@router.get("/{branch_id}/with-children", response_model=BranchWithChildren)
async def get_branch_with_children(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get a branch with all its children."""
    service = BranchService(db)
    branch = await service.get_branch_with_children(branch_id)
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    
    return BranchWithChildren(
        id=branch.id,
        name=branch.name,
        is_headquarters=branch.is_headquarters,
        parent_branch_id=branch.parent_branch_id,
        parent_name=branch.parent.name if branch.parent else None,
        children_count=len(branch.children),
        children=[
            BranchResponse(
                id=c.id,
                name=c.name,
                is_headquarters=c.is_headquarters,
                parent_branch_id=c.parent_branch_id,
                created_at=c.created_at,
                updated_at=c.updated_at
            ) for c in branch.children
        ],
        created_at=branch.created_at,
        updated_at=branch.updated_at
    )


@router.get("/headquarters/get", response_model=BranchResponse)
async def get_headquarters(db: AsyncSession = Depends(get_db)):
    """Get the headquarters branch."""
    service = BranchService(db)
    branch = await service.get_headquarters()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Headquarters not found")
    return branch


@router.post("/", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
async def create_branch(
    schema: BranchCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new branch."""
    service = BranchService(db)
    return await service.create_branch(
        schema.name, 
        schema.is_headquarters,
        schema.parent_branch_id
    )


@router.put("/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: int,
    schema: BranchUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a branch."""
    service = BranchService(db)
    updated = await service.update_branch(
        branch_id,
        schema.name,
        schema.is_headquarters,
        schema.parent_branch_id
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return updated


@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a branch."""
    service = BranchService(db)
    deleted = await service.delete_branch(branch_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
