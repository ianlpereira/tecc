"""
PaymentMethod model for banks/payment institutions.
"""

from sqlalchemy import Column, Integer, String, Boolean
from app.models.base import BaseModel


class PaymentMethod(BaseModel):
    """PaymentMethod model representing banks and payment institutions."""

    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<PaymentMethod(id={self.id}, name={self.name})>"
