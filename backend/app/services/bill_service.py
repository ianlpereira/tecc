"""
Bill service with business logic.
"""

from typing import List, Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Bill, BillStatus, Branch
from app.repositories import BillRepository, BranchRepository


class BillService:
    """Service layer for Bill business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = BillRepository(db)
        self.branch_repository = BranchRepository(db)
        self.db = db

    async def get_all_bills(self) -> List[Bill]:
        """Get all bills."""
        return await self.repository.get_all()

    async def get_bill(self, bill_id: int) -> Optional[Bill]:
        """Get a bill by ID."""
        return await self.repository.get_by_id(bill_id)

    async def get_bills_by_branch(self, branch_id: int) -> List[Bill]:
        """Get all bills for a branch."""
        return await self.repository.get_by_branch(branch_id)

    async def get_bills_by_vendor(self, vendor_id: int) -> List[Bill]:
        """Get all bills from a vendor."""
        return await self.repository.get_by_vendor(vendor_id)

    async def get_pending_bills(self) -> List[Bill]:
        """Get all pending bills."""
        return await self.repository.get_pending_bills()

    async def create_bill(
        self,
        branch_id: int,
        vendor_id: int,
        category_id: int,
        description: str,
        amount: float,
        due_date: date,
        invoice_number: str = None,
        notes: str = None,
    ) -> Bill:
        """Create a new bill."""
        # Validate branch exists
        branch = await self.branch_repository.get_by_id(branch_id)
        if not branch:
            raise ValueError(f"Branch with ID {branch_id} not found")

        # Check for duplicate invoice number if provided
        if invoice_number:
            existing = await self.repository.get_by_invoice(invoice_number)
            if existing:
                raise ValueError(
                    f"Bill with invoice number '{invoice_number}' already exists"
                )

        # Validate amount
        if amount <= 0:
            raise ValueError("Amount must be greater than 0")

        bill = Bill(
            branch_id=branch_id,
            vendor_id=vendor_id,
            category_id=category_id,
            description=description,
            amount=amount,
            due_date=due_date,
            invoice_number=invoice_number,
            notes=notes,
            status=BillStatus.PENDING,
        )
        await self.repository.create(bill)
        await self.repository.commit()
        return bill

    async def update_bill(
        self,
        bill_id: int,
        description: str = None,
        amount: float = None,
        due_date: date = None,
        status: BillStatus = None,
        notes: str = None,
    ) -> Optional[Bill]:
        """Update a bill."""
        bill = await self.repository.get_by_id(bill_id)
        if not bill:
            return None

        update_data = {}
        if description is not None:
            update_data["description"] = description
        if amount is not None:
            if amount <= 0:
                raise ValueError("Amount must be greater than 0")
            update_data["amount"] = amount
        if due_date is not None:
            update_data["due_date"] = due_date
        if status is not None:
            update_data["status"] = status
        if notes is not None:
            update_data["notes"] = notes

        await self.repository.update(bill_id, update_data)
        await self.repository.commit()
        return await self.repository.get_by_id(bill_id)

    async def delete_bill(self, bill_id: int) -> bool:
        """Delete a bill."""
        bill = await self.repository.get_by_id(bill_id)
        if not bill:
            return False

        await self.repository.delete(bill_id)
        await self.repository.commit()
        return True

    async def mark_bill_paid(self, bill_id: int) -> Optional[Bill]:
        """Mark a bill as paid."""
        return await self.update_bill(bill_id, status=BillStatus.PAID)

    async def mark_bill_approved(self, bill_id: int) -> Optional[Bill]:
        """Mark a bill as approved."""
        return await self.update_bill(bill_id, status=BillStatus.APPROVED)

    async def cancel_bill(self, bill_id: int) -> Optional[Bill]:
        """Cancel a bill."""
        return await self.update_bill(bill_id, status=BillStatus.CANCELLED)
