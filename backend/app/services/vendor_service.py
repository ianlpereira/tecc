"""
Vendor service with business logic.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models import Vendor, BillStatus
from app.repositories import VendorRepository, BillRepository


class VendorService:
    """Service layer for Vendor business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = VendorRepository(db)
        self.bill_repository = BillRepository(db)
        self.db = db

    async def get_all_vendors(self) -> List[Vendor]:
        """Get all vendors."""
        return await self.repository.get_all()

    async def get_vendor(self, vendor_id: int) -> Optional[Vendor]:
        """Get a vendor by ID."""
        return await self.repository.get_by_id(vendor_id)

    async def get_vendor_by_name(self, name: str) -> Optional[Vendor]:
        """Get a vendor by name."""
        return await self.repository.get_by_name(name)

    async def get_vendor_by_email(self, email: str) -> Optional[Vendor]:
        """Get a vendor by email."""
        return await self.repository.get_by_email(email)

    async def create_vendor(
        self,
        name: str,
        email: str = None,
        phone: str = None,
        address: str = None,
    ) -> Vendor:
        """Create a new vendor."""
        # Check for duplicate name
        existing = await self.repository.get_by_name(name)
        if existing:
            raise ValueError(f"Vendor with name '{name}' already exists")

        # Check for duplicate email only if a non-empty email was provided
        if email and email.strip():
            existing_email = await self.repository.get_by_email(email)
            if existing_email:
                raise ValueError(f"Vendor with email '{email}' already exists")

        vendor = Vendor(name=name, email=email or None, phone=phone, address=address)
        await self.repository.create(vendor)
        await self.repository.commit()
        return vendor

    async def update_vendor(
        self,
        vendor_id: int,
        name: str = None,
        email: str = None,
        phone: str = None,
        address: str = None,
    ) -> Optional[Vendor]:
        """Update a vendor."""
        vendor = await self.repository.get_by_id(vendor_id)
        if not vendor:
            return None

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if email is not None:
            update_data["email"] = email
        if phone is not None:
            update_data["phone"] = phone
        if address is not None:
            update_data["address"] = address

        await self.repository.update(vendor_id, update_data)
        await self.repository.commit()
        return await self.repository.get_by_id(vendor_id)

    async def delete_vendor(self, vendor_id: int) -> bool:
        """Soft-delete a vendor."""
        vendor = await self.repository.get_by_id(vendor_id)
        if not vendor:
            return False

        # Check if vendor has active bills
        bills = await self.bill_repository.get_by_vendor(vendor_id)
        active_bills = [
            b for b in bills
            if b.status not in (BillStatus.PAID, BillStatus.CANCELLED)
        ]
        if active_bills:
            raise HTTPException(
                status_code=409,
                detail=f"Existem {len(active_bills)} conta(s) ativa(s) vinculada(s) a este fornecedor. Cancele ou quite antes de excluir."
            )

        await self.repository.soft_delete(vendor_id)
        await self.repository.commit()
        return True
