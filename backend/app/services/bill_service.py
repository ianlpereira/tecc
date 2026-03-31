"""
Bill service with business logic.
"""

from typing import List, Optional
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
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

    async def get_bills_by_vehicle(self, vehicle_id: int) -> List[Bill]:
        """Get all bills associated with a vehicle."""
        return await self.repository.get_by_vehicle(vehicle_id)

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
        recurrence_dates: list = None,
        vehicle_id: int = None,
        payment_method_id: int = None,  # Epic 17
    ) -> Bill:
        """Create a new bill. If is_recurring=True, generates N bills.
        Supports three modes:
        - recurrence_day_of_month: fixed day per month (e.g. every 10th)
        - recurrence_interval_days: fixed interval in days
        - recurrence_dates: manual list of due dates (Epic 12)
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

        # ── Epic 12: Manual dates mode ─────────────────────────────────────
        if is_recurring and recurrence_dates:
            if len(recurrence_dates) < 2:
                raise ValueError("Datas manuais exigem pelo menos 2 datas")
            if len(set(recurrence_dates)) != len(recurrence_dates):
                raise ValueError("Datas duplicadas não são permitidas")

            sorted_dates = sorted(recurrence_dates)
            group_id = str(uuid.uuid4())
            total = len(sorted_dates)
            first_bill = None

            for i, occurrence_date in enumerate(sorted_dates):
                bill = Bill(
                    branch_id=branch_id,
                    vendor_id=vendor_id,
                    category_id=category_id,
                    description=description,
                    amount=amount,
                    due_date=occurrence_date,
                    invoice_number=None,
                    notes=notes,
                    status=BillStatus.PENDING,
                    is_recurring=True,
                    recurrence_group_id=group_id,
                    recurrence_interval_days=None,
                    recurrence_day_of_month=None,
                    recurrence_total=total,
                    recurrence_index=i + 1,
                    vehicle_id=vehicle_id,
                    payment_method_id=payment_method_id,
                )
                if i == 0 and invoice_number:
                    bill.invoice_number = invoice_number
                await self.repository.create(bill)
                if first_bill is None:
                    first_bill = bill

            await self.repository.commit()
            return first_bill

        # ── Validate recurrence parameters (interval / fixed-day modes) ────
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
                    vehicle_id=vehicle_id,
                    payment_method_id=payment_method_id,
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
            vehicle_id=vehicle_id,
            payment_method_id=payment_method_id,
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
        invoice_number: str = None,
        notes: str = None,
        payment_bank: str = None,
        paid_at: date = None,
        vendor_id: int = None,
        category_id: int = None,
        branch_id: int = None,
        vehicle_id: int = None,
        payment_method_id: int = None,  # Epic 17
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
        if invoice_number is not None:
            update_data["invoice_number"] = invoice_number
        if notes is not None:
            update_data["notes"] = notes
        if payment_bank is not None:
            update_data["payment_bank"] = payment_bank
        if paid_at is not None:
            update_data["paid_at"] = paid_at
        if vendor_id is not None:
            update_data["vendor_id"] = vendor_id
        if category_id is not None:
            update_data["category_id"] = category_id
        if branch_id is not None:
            update_data["branch_id"] = branch_id
        if vehicle_id is not None:
            update_data["vehicle_id"] = vehicle_id
        if payment_method_id is not None:
            update_data["payment_method_id"] = payment_method_id

        await self.repository.update(bill_id, update_data)
        await self.repository.commit()
        return await self.repository.get_by_id(bill_id)

    async def delete_bill(self, bill_id: int) -> bool:
        """Soft-delete a bill."""
        bill = await self.repository.get_by_id(bill_id)
        if not bill:
            return False

        await self.repository.soft_delete(bill_id)
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

    # ── Epic 13: Recurrence edit scope ─────────────────────────────────────

    async def update_bill_recurrence(
        self,
        bill_id: int,
        scope: str,
        description: str = None,
        amount: float = None,
        due_date: date = None,
        invoice_number: str = None,
        notes: str = None,
        vendor_id: int = None,
        category_id: int = None,
        branch_id: int = None,
        vehicle_id: int = None,
        payment_method_id: int = None,  # Epic 17
    ) -> Optional[Bill]:
        """Update a recurring bill with scope: 'this' | 'this_and_next' | 'all'."""
        bill = await self.repository.get_by_id(bill_id)
        if not bill:
            return None

        update_fields = {}
        if description is not None:
            update_fields["description"] = description
        if amount is not None:
            if amount <= 0:
                raise ValueError("Amount must be greater than 0")
            update_fields["amount"] = amount
        if invoice_number is not None:
            update_fields["invoice_number"] = invoice_number
        if notes is not None:
            update_fields["notes"] = notes
        if vendor_id is not None:
            update_fields["vendor_id"] = vendor_id
        if category_id is not None:
            update_fields["category_id"] = category_id
        if branch_id is not None:
            update_fields["branch_id"] = branch_id
        if vehicle_id is not None:
            update_fields["vehicle_id"] = vehicle_id
        if payment_method_id is not None:
            update_fields["payment_method_id"] = payment_method_id

        if scope == "this":
            if due_date is not None:
                update_fields["due_date"] = due_date
            await self.repository.update(bill_id, update_fields)

        elif scope in ("this_and_next", "all"):
            if not bill.recurrence_group_id:
                # Not part of a group – fall back to single update
                if due_date is not None:
                    update_fields["due_date"] = due_date
                await self.repository.update(bill_id, update_fields)
            else:
                group_bills = await self.repository.get_by_recurrence_group(
                    bill.recurrence_group_id
                )
                # Filter candidates
                if scope == "this_and_next":
                    candidates = [
                        b for b in group_bills
                        if b.recurrence_index >= bill.recurrence_index
                    ]
                else:
                    candidates = list(group_bills)

                # Compute date offset if due_date changed
                date_delta = None
                if due_date is not None and bill.due_date is not None:
                    date_delta = due_date - bill.due_date

                for candidate in candidates:
                    if candidate.status in (BillStatus.PAID, BillStatus.CANCELLED):
                        continue
                    candidate_fields = dict(update_fields)
                    if date_delta is not None:
                        candidate_fields["due_date"] = candidate.due_date + date_delta
                    await self.repository.update(candidate.id, candidate_fields)

        await self.repository.commit()
        return await self.repository.get_by_id(bill_id)

    # ── Epic 14: Batch actions ───────────────────────────────────────────────

    async def batch_soft_delete(self, ids: list) -> int:
        """Soft-delete multiple bills. Returns count of deleted."""
        deleted = 0
        for bill_id in ids:
            bill = await self.repository.get_by_id(bill_id)
            if bill:
                await self.repository.soft_delete(bill_id)
                deleted += 1
        await self.repository.commit()
        return deleted

    async def batch_mark_paid(
        self,
        ids: list,
        payment_bank: str = None,
        paid_at: date = None,
    ) -> dict:
        """Mark multiple bills as paid. Skips already paid/cancelled. Returns updated/skipped counts."""
        updated = 0
        skipped = 0
        for bill_id in ids:
            bill = await self.repository.get_by_id(bill_id)
            if not bill:
                skipped += 1
                continue
            if bill.status in (BillStatus.PAID, BillStatus.CANCELLED):
                skipped += 1
                continue
            update_fields: dict = {"status": BillStatus.PAID}
            if payment_bank is not None:
                update_fields["payment_bank"] = payment_bank
            if paid_at is not None:
                update_fields["paid_at"] = paid_at
            await self.repository.update(bill_id, update_fields)
            updated += 1
        await self.repository.commit()
        return {"updated": updated, "skipped": skipped}

    # ── Epic 15: Due-today summary ───────────────────────────────────────────

    async def get_due_today_summary(self, branch_id: int = None) -> dict:
        """Return count/amount of bills due today and overdue (pending/approved)."""
        from datetime import date as date_cls
        today = date_cls.today()
        all_bills = (
            await self.repository.get_by_branch(branch_id)
            if branch_id
            else await self.repository.get_all()
        )
        active_statuses = {BillStatus.PENDING, BillStatus.APPROVED}
        relevant = [b for b in all_bills if b.status in active_statuses]

        overdue = [b for b in relevant if b.due_date < today]
        due_today = [b for b in relevant if b.due_date == today]

        return {
            "count": len(overdue) + len(due_today),
            "total_amount": sum(b.amount for b in overdue + due_today),
            "overdue_count": len(overdue),
            "overdue_amount": sum(b.amount for b in overdue),
            "due_today_count": len(due_today),
            "due_today_amount": sum(b.amount for b in due_today),
        }

    # ── Epic 16: Report ──────────────────────────────────────────────────────

    async def get_report(
        self,
        date_from: date = None,
        date_to: date = None,
        month: str = None,
        branch_ids: list = None,
        vendor_ids: list = None,
        category_ids: list = None,
        vehicle_ids: list = None,
        statuses: list = None,
        payment_banks: list = None,
        payment_method_ids: list = None,  # Epic 17
    ) -> dict:
        """Get report rows with joined names + summary totals."""
        rows = await self.repository.get_for_report(
            date_from=date_from,
            date_to=date_to,
            month=month,
            branch_ids=branch_ids,
            vendor_ids=vendor_ids,
            category_ids=category_ids,
            vehicle_ids=vehicle_ids,
            statuses=statuses,
            payment_banks=payment_banks,
            payment_method_ids=payment_method_ids,
        )

        paid_amount = sum(r["amount"] for r in rows if r["status"] == BillStatus.PAID)
        pending_amount = sum(
            r["amount"] for r in rows
            if r["status"] in (BillStatus.PENDING, BillStatus.APPROVED)
        )
        summary = {
            "total_amount": sum(r["amount"] for r in rows),
            "paid_amount": paid_amount,
            "pending_amount": pending_amount,
            "count": len(rows),
        }
        return {"rows": rows, "summary": summary}
