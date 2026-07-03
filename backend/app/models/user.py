"""
User model - Authentication & Authorization.
"""

from sqlalchemy import Column, Integer, String, Boolean
from app.models.base import BaseModel


class UserRole:
    ADMIN = "admin"
    USER = "user"


class User(BaseModel):
    """User model for authentication."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(16), nullable=False, default=UserRole.USER)
    is_active = Column(Boolean, nullable=False, default=True)
    must_change_password = Column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username!r}, role={self.role!r})>"
