"""
User repository for CRUD operations on users.
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, User)

    async def get_by_id(self, id: int) -> Optional[User]:
        """Get active (non-deleted) user by ID."""
        result = await self.db.execute(
            select(User).where(
                User.id == id,
                User.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username (case-insensitive)."""
        result = await self.db.execute(
            select(User).where(
                User.username == username,
                User.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User).where(
                User.email == email,
                User.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[User]:
        """Get all non-deleted users ordered by username."""
        result = await self.db.execute(
            select(User)
            .where(User.deleted_at == None)  # noqa: E711
            .order_by(User.username)
        )
        return result.scalars().all()

    async def username_exists(self, username: str, exclude_id: int = None) -> bool:
        """Check if a username is already taken."""
        stmt = select(User).where(
            User.username == username,
            User.deleted_at == None,  # noqa: E711
        )
        if exclude_id is not None:
            stmt = stmt.where(User.id != exclude_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def admin_exists(self) -> bool:
        """Check if at least one active admin user exists."""
        from sqlalchemy import func
        from app.models.user import UserRole
        result = await self.db.execute(
            select(func.count()).select_from(User).where(
                User.role == UserRole.ADMIN,
                User.is_active == True,  # noqa: E712
                User.deleted_at == None,  # noqa: E711
            )
        )
        return (result.scalar_one() or 0) > 0

    async def count_active_admins(self) -> int:
        """Return the number of active admin users."""
        from sqlalchemy import func
        from app.models.user import UserRole
        result = await self.db.execute(
            select(func.count()).where(
                User.role == UserRole.ADMIN,
                User.is_active == True,  # noqa: E712
                User.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one()
