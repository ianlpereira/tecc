"""
Bill service with business logic.
"""

from typing import List, Optional
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Bill, BillStatus, Branch
from app.repositories import BillRepository, BranchRepository
import uuid


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

    async def get_bills_by_branch(
        self, 
        branch_id: int, 
        include_children: bool = False
    ) -> List[Bill]:
        """
        Get all bills for a branch, optionally including children branches.
        
        Args:
            branch_id: The branch ID to filter by
            include_children: If True, includes bills from child branches
            
        Returns:
            List of bills
        """
        if include_children:
            # Get branch IDs including children
            branch_ids = await self.branch_repository.get_branch_ids_for_filter(
                branch_id, include_children=True
            )
            return await self.repository.get_by_branches(branch_ids)
        else:
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
        is_recurring: bool = False,
        recurrence_interval_days: int = None,
        recurrence_occurrences: int = None,
        recurrence_day_of_month: int = None,
    ) -> Bill:
        """Create a new bill. If is_recurring=True, generates N bills.
        Supports two modes:
        - recurrence_day_of_month: fixed day per month (e.g. every 10th)
        - recurrence_interval_days: fixed interval in days
        """
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

        # Validate recurrence parameters
        if is_recurring:
            if not recurrence_occurrences or not (2 <= recurrence_occurrences <= 60):
                raise ValueError("Número de ocorrências deve ser entre 2 e 60")

            if recurrence_day_of_month:
                if not (1 <= recurrence_day_of_month <= 28):
                    raise ValueError("Dia fixo deve ser entre 1 e 28")
            elif not recurrence_interval_days or recurrence_interval_days < 1:
                raise ValueError("Intervalo de recorrência deve ser maior que 0")

            group_id = str(uuid.uuid4())
            first_bill = None

            for i in range(recurrence_occurrences):
                # Calculate occurrence due date based on mode
                if recurrence_day_of_month:
                    occurrence_due_date = (
                        due_date.replace(day=recurrence_day_of_month)
                        + relativedelta(months=i)
                    )
                else:
                    occurrence_due_date = due_date + timedelta(days=i * recurrence_interval_days)

                bill = Bill(
                    branch_id=branch_id,
                    vendor_id=vendor_id,
                    category_id=category_id,
                    description=description,
                    amount=amount,
                    due_date=occurrence_due_date,
                    invoice_number=None,
                    notes=notes,
                    status=BillStatus.PENDING,
                    is_recurring=True,
                    recurrence_group_id=group_id,
                    recurrence_interval_days=recurrence_interval_days,
                    recurrence_day_of_month=recurrence_day_of_month,
                    recurrence_total=recurrence_occurrences,
                    recurrence_index=i + 1,
                )
                # Assign invoice_number only to the first occurrence
                if i == 0 and invoice_number:
                    bill.invoice_number = invoice_number

                await self.repository.create(bill)
                if first_bill is None:
                    first_bill = bill

            await self.repository.commit()
            return first_bill

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

    async def get_bills_by_recurrence_group(self, group_id: str) -> List[Bill]:
        """Get all bills in a recurrence group, ordered by index."""
        return await self.repository.get_by_recurrence_group(group_id)

    async def update_bill(
        self,
        bill_id: int,
        description: str = None,
        amount: float = None,
        due_date: date = None,
        status: BillStatus = None,
        notes: str = None,
        payment_bank: str = None,
        paid_at: date = None,
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
        if payment_bank is not None:
            update_data["payment_bank"] = payment_bank
        if paid_at is not None:
            update_data["paid_at"] = paid_at

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

    async def mark_bill_paid(
        self,
        bill_id: int,
        payment_bank: str = None,
        paid_at: date = None,
    ) -> Optional[Bill]:
        """Mark a bill as paid, optionally recording bank and payment date."""
        return await self.update_bill(
            bill_id,
            status=BillStatus.PAID,
            payment_bank=payment_bank,
            paid_at=paid_at,
        )

    async def mark_bill_approved(self, bill_id: int) -> Optional[Bill]:
        """Mark a bill as approved."""
        return await self.update_bill(bill_id, status=BillStatus.APPROVED)

    async def cancel_bill(self, bill_id: int) -> Optional[Bill]:
        """Cancel a bill."""
        return await self.update_bill(bill_id, status=BillStatus.CANCELLED)
