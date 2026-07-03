"""
BillAttachment router — upload, list, download, delete.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
import base64

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas import BillAttachmentResponse, BillAttachmentWithData
from app.services.bill_attachment_service import BillAttachmentService

router = APIRouter(prefix="/api/v1/bills/{bill_id}/attachments", tags=["bill-attachments"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=List[BillAttachmentResponse])
async def list_attachments(bill_id: int, db: AsyncSession = Depends(get_db)):
    """List all attachments for a bill."""
    service = BillAttachmentService(db)
    return await service.get_attachments(bill_id)


@router.post("/", response_model=BillAttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    bill_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a file attachment to a bill (PDF, JPEG, PNG — max 5MB)."""
    service = BillAttachmentService(db)
    try:
        return await service.upload_attachment(bill_id, file)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{attachment_id}/download")
async def download_attachment(
    bill_id: int,
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Download a specific attachment (returns raw file bytes)."""
    service = BillAttachmentService(db)
    attachment = await service.get_attachment(bill_id, attachment_id)
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anexo não encontrado")

    file_bytes = base64.b64decode(attachment.file_data)
    return Response(
        content=file_bytes,
        media_type=attachment.mime_type or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{attachment.filename}"'},
    )


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    bill_id: int,
    attachment_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a specific attachment."""
    service = BillAttachmentService(db)
    deleted = await service.delete_attachment(bill_id, attachment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anexo não encontrado")
