"""
BillAttachment schemas for Pydantic validation.
"""

from app.schemas.base import BaseSchema, TimestampedSchema


class BillAttachmentResponse(TimestampedSchema):
    """Schema for attachment response (without file_data to keep payload small)."""

    id: int
    bill_id: int
    filename: str
    mime_type: str | None = None
    file_size: int | None = None


class BillAttachmentWithData(BillAttachmentResponse):
    """Schema for attachment download (includes base64 file_data)."""

    file_data: str
