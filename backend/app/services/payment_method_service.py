"""
PaymentMethod service with business logic.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment_method import PaymentMethod
from app.repositories.payment_method_repository import PaymentMethodRepository


INITIAL_PAYMENT_METHODS = [
    "Bradesco Viana",
    "Bradesco Matinha",
    "Bradesco V. de Almeida",
    "Bradesco Maracacumé",
    "BNB SLZ",
    "BNB V. de Almeida",
    "BB Junco",
    "BB SLZ",
    "Caixa Econômica SLZ",
    "Caixa Econômica Arari",
]


class PaymentMethodService:
    """Service layer for PaymentMethod business logic."""

    def __init__(self, db: AsyncSession):
        self.repository = PaymentMethodRepository(db)
        self.db = db

    async def get_all(self) -> List[PaymentMethod]:
        """Get all non-deleted payment methods."""
        return await self.repository.get_all()

    async def get_active(self) -> List[PaymentMethod]:
        """Get all active payment methods."""
        return await self.repository.get_active()

    async def get_by_id(self, payment_method_id: int) -> Optional[PaymentMethod]:
        """Get a payment method by ID."""
        return await self.repository.get_by_id(payment_method_id)

    async def create(self, name: str, is_active: bool = True) -> PaymentMethod:
        """Create a new payment method."""
        existing = await self.repository.get_by_name(name)
        if existing:
            raise ValueError(f"Payment method '{name}' already exists")
        pm = PaymentMethod(name=name, is_active=is_active)
        await self.repository.create(pm)
        await self.repository.commit()
        return pm

    async def update(
        self,
        payment_method_id: int,
        name: str | None = None,
        is_active: bool | None = None,
    ) -> Optional[PaymentMethod]:
        """Update a payment method."""
        pm = await self.repository.get_by_id(payment_method_id)
        if not pm:
            return None

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if is_active is not None:
            update_data["is_active"] = is_active

        if update_data:
            await self.repository.update(pm, update_data)
            await self.repository.commit()

        return pm

    async def delete(self, payment_method_id: int) -> bool:
        """Soft-delete a payment method."""
        pm = await self.repository.get_by_id(payment_method_id)
        if not pm:
            return False
        await self.repository.soft_delete(pm)
        await self.repository.commit()
        return True

    async def seed_initial_data(self) -> int:
        """Seed initial payment methods if none exist. Returns count created."""
        existing = await self.repository.get_all()
        if existing:
            return 0
        count = 0
        for name in INITIAL_PAYMENT_METHODS:
            pm = PaymentMethod(name=name, is_active=True)
            await self.repository.create(pm)
            count += 1
        await self.repository.commit()
        return count
