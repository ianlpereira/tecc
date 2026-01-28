"""
Bill model for accounts payable.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, Date
from app.models.base import BaseModel
import enum
from datetime import date


class BillStatus(str, enum.Enum):
    """Status enum for bills."""
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    CANCELLED = "cancelled"


class Bill(BaseModel):
    """Bill model representing accounts payable."""

    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    description = Column(String(500), nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(BillStatus), default=BillStatus.PENDING, nullable=False)
    invoice_number = Column(String(100), nullable=True)
    notes = Column(String(1000), nullable=True)

    def __repr__(self) -> str:
        return f"<Bill(id={self.id}, branch_id={self.branch_id}, vendor_id={self.vendor_id}, amount={self.amount})>"
