"""
Vendor model for suppliers/vendors.
"""

from sqlalchemy import Column, Integer, String, Text
from app.models.base import BaseModel


class Vendor(BaseModel):
    """Vendor model representing suppliers."""

    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<Vendor(id={self.id}, name={self.name})>"
