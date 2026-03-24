"""
Category service with business logic.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models import Category, BillStatus
from app.repositories import CategoryRepository, BillRepository


class CategoryService:
    """Service layer for Category business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = CategoryRepository(db)
        self.bill_repository = BillRepository(db)
        self.db = db

    async def get_all_categories(self) -> List[Category]:
        """Get all categories."""
        return await self.repository.get_all()

    async def get_category(self, category_id: int) -> Optional[Category]:
        """Get a category by ID."""
        return await self.repository.get_by_id(category_id)

    async def get_category_by_name(self, name: str) -> Optional[Category]:
        """Get a category by name."""
        return await self.repository.get_by_name(name)

    async def create_category(
        self, name: str, description: str = None
    ) -> Category:
        """Create a new category."""
        # Check for duplicate name
        existing = await self.repository.get_by_name(name)
        if existing:
            raise ValueError(f"Category with name '{name}' already exists")

        category = Category(name=name, description=description)
        await self.repository.create(category)
        await self.repository.commit()
        return category

    async def update_category(
        self, category_id: int, name: str = None, description: str = None
    ) -> Optional[Category]:
        """Update a category."""
        category = await self.repository.get_by_id(category_id)
        if not category:
            return None

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description

        await self.repository.update(category_id, update_data)
        await self.repository.commit()
        return await self.repository.get_by_id(category_id)

    async def delete_category(self, category_id: int) -> bool:
        """Soft-delete a category."""
        category = await self.repository.get_by_id(category_id)
        if not category:
            return False

        # Check if category has active bills
        bills = await self.bill_repository.get_by_category(category_id)
        active_bills = [
            b for b in bills
            if b.status not in (BillStatus.PAID, BillStatus.CANCELLED)
        ]
        if active_bills:
            raise HTTPException(
                status_code=409,
                detail=f"Existem {len(active_bills)} conta(s) ativa(s) vinculada(s) a esta categoria. Cancele ou quite antes de excluir."
            )

        await self.repository.soft_delete(category_id)
        await self.repository.commit()
        return True
