"""
Generic repository base class for CRUD operations.
"""

from typing import Generic, TypeVar, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Base repository providing generic CRUD operations."""

    def __init__(self, db: AsyncSession, model: type[T]):
        self.db = db
        self.model = model

    async def get_all(self) -> List[T]:
        """Retrieve all records."""
        result = await self.db.execute(select(self.model))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> Optional[T]:
        """Retrieve a record by ID."""
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def create(self, obj: T) -> T:
        """Create a new record."""
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update(self, id: int, obj_data: dict) -> Optional[T]:
        """Update a record by ID."""
        db_obj = await self.get_by_id(id)
        if db_obj:
            for key, value in obj_data.items():
                setattr(db_obj, key, value)
            await self.db.flush()
            await self.db.refresh(db_obj)
        return db_obj

    async def delete(self, id: int) -> bool:
        """Delete a record by ID."""
        db_obj = await self.get_by_id(id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.flush()
            return True
        return False

    async def commit(self) -> None:
        """Commit changes to database."""
        await self.db.commit()
