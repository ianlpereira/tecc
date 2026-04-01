"""
Bill repository for CRUD operations on bills.
"""

from typing import List, Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from app.models import Bill, BillStatus
from app.models.payment_method import PaymentMethod
from app.repositories.base import BaseRepository


class BillRepository(BaseRepository[Bill]):
    """Repository for Bill model."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Bill)

    async def get_all(self) -> List[Bill]:
        """Retrieve all non-deleted bills, with payment_method eagerly loaded."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(Bill.deleted_at == None)  # noqa: E711
            .order_by(Bill.due_date, Bill.description)
        )
        return result.unique().scalars().all()

    async def get_by_id(self, id: int) -> Optional[Bill]:
        """Retrieve a non-deleted bill by ID, with payment_method eagerly loaded."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.id == id,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.unique().scalar_one_or_none()

    async def get_by_branch(self, branch_id: int) -> List[Bill]:
        """Get all non-deleted bills for a branch."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.branch_id == branch_id,
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.due_date, Bill.description)
        )
        return result.unique().scalars().all()

    async def get_by_branches(self, branch_ids: List[int]) -> List[Bill]:
        """Get all non-deleted bills for multiple branches (for hierarchy filtering)."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.branch_id.in_(branch_ids),
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.due_date, Bill.description)
        )
        return result.unique().scalars().all()

    async def get_by_vendor(self, vendor_id: int) -> List[Bill]:
        """Get all non-deleted bills from a vendor."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.vendor_id == vendor_id,
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.due_date, Bill.description)
        )
        return result.unique().scalars().all()

    async def get_by_status(self, status: BillStatus) -> List[Bill]:
        """Get all non-deleted bills with a specific status."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.status == status,
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.due_date, Bill.description)
        )
        return result.unique().scalars().all()

    async def get_pending_bills(self) -> List[Bill]:
        """Get all pending bills."""
        return await self.get_by_status(BillStatus.PENDING)

    async def get_by_invoice(self, invoice_number: str) -> Optional[Bill]:
        """Get non-deleted bill by invoice number."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.invoice_number == invoice_number,
                Bill.deleted_at == None,  # noqa: E711
            )
        )
        return result.unique().scalar_one_or_none()

    async def get_by_recurrence_group(self, group_id: str) -> List[Bill]:
        """Get all non-deleted bills belonging to a recurrence group, ordered by index."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.recurrence_group_id == group_id,
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.recurrence_index)
        )
        return result.unique().scalars().all()

    async def get_by_vehicle(self, vehicle_id: int) -> List[Bill]:
        """Get all non-deleted bills associated with a vehicle."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.vehicle_id == vehicle_id,
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.due_date, Bill.description)
        )
        return result.unique().scalars().all()

    async def get_by_category(self, category_id: int) -> List[Bill]:
        """Get all non-deleted bills for a category."""
        result = await self.db.execute(
            select(Bill)
            .options(joinedload(Bill.payment_method))
            .where(
                Bill.category_id == category_id,
                Bill.deleted_at == None,  # noqa: E711
            )
            .order_by(Bill.due_date, Bill.description)
        )
        return result.unique().scalars().all()

    async def get_for_report(
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
    ) -> list:
        """Get bills for the reports page with joined vendor/category/branch/vehicle/payment_method names."""
        from app.models.vendor import Vendor
        from app.models.category import Category
        from app.models.branch import Branch
        from app.models.vehicle import Vehicle
        from app.models.payment_method import PaymentMethod

        stmt = (
            select(
                Bill,
                Vendor.name.label("vendor_name"),
                Category.name.label("category_name"),
                Branch.name.label("branch_name"),
                Vehicle.plate.label("vehicle_plate"),
                PaymentMethod.name.label("payment_method_name"),
            )
            .outerjoin(Vendor, Bill.vendor_id == Vendor.id)
            .outerjoin(Category, Bill.category_id == Category.id)
            .outerjoin(Branch, Bill.branch_id == Branch.id)
            .outerjoin(Vehicle, Bill.vehicle_id == Vehicle.id)
            .outerjoin(PaymentMethod, Bill.payment_method_id == PaymentMethod.id)
            .where(Bill.deleted_at == None)  # noqa: E711
        )

        if date_from:
            stmt = stmt.where(Bill.due_date >= date_from)
        if date_to:
            stmt = stmt.where(Bill.due_date <= date_to)
        if month:
            # month format: "YYYY-MM"
            stmt = stmt.where(
                Bill.due_date >= date(int(month[:4]), int(month[5:7]), 1)
            )
            import calendar
            last_day = calendar.monthrange(int(month[:4]), int(month[5:7]))[1]
            stmt = stmt.where(
                Bill.due_date <= date(int(month[:4]), int(month[5:7]), last_day)
            )
        if branch_ids:
            stmt = stmt.where(Bill.branch_id.in_(branch_ids))
        if vendor_ids:
            stmt = stmt.where(Bill.vendor_id.in_(vendor_ids))
        if category_ids:
            stmt = stmt.where(Bill.category_id.in_(category_ids))
        if vehicle_ids:
            stmt = stmt.where(Bill.vehicle_id.in_(vehicle_ids))
        if statuses:
            stmt = stmt.where(Bill.status.in_(statuses))
        if payment_banks:
            stmt = stmt.where(Bill.payment_bank.in_(payment_banks))
        if payment_method_ids:
            stmt = stmt.where(Bill.payment_method_id.in_(payment_method_ids))

        stmt = stmt.order_by(Bill.due_date, Bill.description)
        result = await self.db.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.Bill.id,
                "description": row.Bill.description,
                "vendor_name": row.vendor_name,
                "category_name": row.category_name,
                "branch_name": row.branch_name,
                "vehicle_plate": row.vehicle_plate,
                "amount": row.Bill.amount,
                "due_date": row.Bill.due_date,
                "status": row.Bill.status,
                "payment_bank": row.Bill.payment_bank,
                "paid_at": row.Bill.paid_at,
                "payment_method_name": row.payment_method_name,
            }
            for row in rows
        ]
