"""
Vendor schemas for Pydantic validation.
"""

from app.schemas.base import BaseSchema, TimestampedSchema


class VendorBase(BaseSchema):
    """Base vendor schema."""

    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class VendorCreate(VendorBase):
    """Schema for creating a vendor."""

    pass


class VendorUpdate(BaseSchema):
    """Schema for updating a vendor."""

    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class VendorResponse(TimestampedSchema):
    """Schema for vendor response."""

    id: int
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None
