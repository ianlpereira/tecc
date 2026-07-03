"""
BillAttachment service with business logic.
"""

import base64
from typing import List
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import BillAttachment
from app.repositories import BillAttachmentRepository


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_ATTACHMENTS_PER_BILL = 3
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


class BillAttachmentService:
    """Service layer for BillAttachment business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = BillAttachmentRepository(db)

    async def get_attachments(self, bill_id: int) -> List[BillAttachment]:
        """Get all attachments for a bill (without file_data)."""
        return await self.repository.get_by_bill(bill_id)

    async def get_attachment(self, bill_id: int, attachment_id: int) -> BillAttachment | None:
        """Get a specific attachment with file_data for download."""
        return await self.repository.get_by_bill_and_id(bill_id, attachment_id)

    async def upload_attachment(self, bill_id: int, file: UploadFile) -> BillAttachment:
        """Upload and store a file attachment for a bill."""
        # Check attachment limit
        count = await self.repository.count_by_bill(bill_id)
        if count >= MAX_ATTACHMENTS_PER_BILL:
            raise ValueError(f"Máximo de {MAX_ATTACHMENTS_PER_BILL} anexos por conta atingido")

        # Validate MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise ValueError(
                f"Tipo de arquivo não suportado: {file.content_type}. "
                "Use PDF, JPEG, PNG ou WebP."
            )

        # Read and validate size
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise ValueError("Arquivo muito grande. Tamanho máximo: 5MB")

        # Encode to base64
        file_data = base64.b64encode(file_bytes).decode("utf-8")

        attachment = BillAttachment(
            bill_id=bill_id,
            filename=file.filename or "arquivo",
            mime_type=file.content_type,
            file_size=len(file_bytes),
            file_data=file_data,
        )
        await self.repository.create(attachment)
        await self.repository.commit()
        return attachment

    async def delete_attachment(self, bill_id: int, attachment_id: int) -> bool:
        """Delete a specific attachment."""
        attachment = await self.repository.get_by_bill_and_id(bill_id, attachment_id)
        if not attachment:
            return False
        await self.repository.hard_delete(attachment_id)
        await self.repository.commit()
        return True
