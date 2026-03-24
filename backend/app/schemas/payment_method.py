"""
PaymentMethod schemas for Pydantic validation.
"""

from app.schemas.base import BaseSchema, TimestampedSchema


class PaymentMethodBase(BaseSchema):
    """Base payment method schema."""

    name: str
    is_active: bool = True


class PaymentMethodCreate(PaymentMethodBase):
    """Schema for creating a payment method."""

    pass


class PaymentMethodUpdate(BaseSchema):
    """Schema for updating a payment method."""

    name: str | None = None
    is_active: bool | None = None


class PaymentMethodResponse(TimestampedSchema):
    """Schema for payment method response."""

    id: int
    name: str
    is_active: bool
