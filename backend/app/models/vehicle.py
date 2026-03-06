"""
Vehicle model for fleet management.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.models.base import BaseModel


class Vehicle(BaseModel):
    """Vehicle model representing fleet vehicles."""

    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plate = Column(String(20), nullable=False, unique=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    notes = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<Vehicle(id={self.id}, plate={self.plate}, brand={self.brand}, model={self.model})>"
