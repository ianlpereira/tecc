"""
BillAttachment model for file attachments on bills.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.models.base import BaseModel


class BillAttachment(BaseModel):
    """Model for files attached to a bill (e.g. boleto PDF, NF-e)."""

    __tablename__ = "bill_attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    bill_id = Column(Integer, ForeignKey("bills.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)       # bytes
    file_data = Column(Text, nullable=False)          # base64-encoded file content

    def __repr__(self) -> str:
        return f"<BillAttachment(id={self.id}, bill_id={self.bill_id}, filename={self.filename!r})>"
