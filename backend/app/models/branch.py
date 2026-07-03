"""
Branch model for company branches/locations.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Branch(BaseModel):
    """Branch model representing company branches/locations."""

    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    is_headquarters = Column(Boolean, default=False, nullable=False)
    parent_branch_id = Column(
        Integer, 
        ForeignKey("branches.id", ondelete="SET NULL"), 
        nullable=True
    )

    # Relationships
    parent = relationship(
        "Branch",
        remote_side=[id],
        backref="children",
        foreign_keys=[parent_branch_id]
    )

    def __repr__(self) -> str:
        return f"<Branch(id={self.id}, name={self.name}, is_headquarters={self.is_headquarters}, parent_id={self.parent_branch_id})>"
