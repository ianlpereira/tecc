"""
Vehicle schemas for Pydantic validation.
"""

from app.schemas.base import BaseSchema, TimestampedSchema


class VehicleBase(BaseSchema):
    """Base vehicle schema."""

    plate: str
    brand: str
    model: str
    year: int | None = None
    branch_id: int
    notes: str | None = None


class VehicleCreate(VehicleBase):
    """Schema for creating a vehicle."""
    pass


class VehicleUpdate(BaseSchema):
    """Schema for updating a vehicle."""

    plate: str | None = None
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    branch_id: int | None = None
    notes: str | None = None


class VehicleResponse(TimestampedSchema):
    """Schema for vehicle response."""

    id: int
    plate: str
    brand: str
    model: str
    year: int | None = None
    branch_id: int
    notes: str | None = None
