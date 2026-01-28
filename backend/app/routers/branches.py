"""
Branch router with CRUD endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import BranchCreate, BranchUpdate, BranchResponse
from app.services import BranchService

router = APIRouter(prefix="/api/v1/branches", tags=["branches"])


@router.get("/", response_model=List[BranchResponse])
async def list_branches(db: AsyncSession = Depends(get_db)):
    """Get all branches."""
    service = BranchService(db)
    return await service.get_all_branches()


@router.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get a branch by ID."""
    service = BranchService(db)
    branch = await service.get_branch(branch_id)
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return branch


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
    try:
        return await service.create_branch(schema.name, schema.is_headquarters)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: int,
    schema: BranchUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a branch."""
    service = BranchService(db)
    try:
        updated = await service.update_branch(
            branch_id,
            schema.name,
            schema.is_headquarters,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a branch."""
    service = BranchService(db)
    try:
        deleted = await service.delete_branch(branch_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
