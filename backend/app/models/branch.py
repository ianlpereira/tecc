"""
Branch model for company branches/locations.
"""

from sqlalchemy import Column, Integer, String, Boolean
from app.models.base import BaseModel


class Branch(BaseModel):
    """Branch model representing company branches/locations."""

    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    is_headquarters = Column(Boolean, default=False, nullable=False)

    def __repr__(self) -> str:
        return f"<Branch(id={self.id}, name={self.name}, is_headquarters={self.is_headquarters})>"
