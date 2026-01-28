"""
Vendor service with business logic.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Vendor
from app.repositories import VendorRepository


class VendorService:
    """Service layer for Vendor business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = VendorRepository(db)
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

        # Check for duplicate email if provided
        if email:
            existing_email = await self.repository.get_by_email(email)
            if existing_email:
                raise ValueError(f"Vendor with email '{email}' already exists")

        vendor = Vendor(name=name, email=email, phone=phone, address=address)
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
        """Delete a vendor."""
        vendor = await self.repository.get_by_id(vendor_id)
        if not vendor:
            return False

        await self.repository.delete(vendor_id)
        await self.repository.commit()
        return True
