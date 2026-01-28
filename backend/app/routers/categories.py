"""
Category router with CRUD endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services import CategoryService

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Get all categories."""
    service = CategoryService(db)
    return await service.get_all_categories()


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    """Get a category by ID."""
    service = CategoryService(db)
    category = await service.get_category(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    schema: CategoryCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new category."""
    service = CategoryService(db)
    try:
        return await service.create_category(schema.name, schema.description)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    schema: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a category."""
    service = CategoryService(db)
    try:
        updated = await service.update_category(
            category_id,
            schema.name,
            schema.description,
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a category."""
    service = CategoryService(db)
    deleted = await service.delete_category(category_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
