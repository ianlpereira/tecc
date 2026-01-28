"""
Category service with business logic.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Category
from app.repositories import CategoryRepository


class CategoryService:
    """Service layer for Category business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = CategoryRepository(db)
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
        """Delete a category."""
        category = await self.repository.get_by_id(category_id)
        if not category:
            return False

        await self.repository.delete(category_id)
        await self.repository.commit()
        return True
