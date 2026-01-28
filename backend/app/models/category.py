"""
Category model for expense categories.
"""

from sqlalchemy import Column, Integer, String
from app.models.base import BaseModel


class Category(BaseModel):
    """Category model representing expense categories."""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name={self.name})>"
