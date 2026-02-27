"""add recurrence fields to bills

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('bills', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('bills', sa.Column('recurrence_group_id', sa.String(36), nullable=True))
    op.add_column('bills', sa.Column('recurrence_interval_days', sa.Integer(), nullable=True))
    op.add_column('bills', sa.Column('recurrence_total', sa.Integer(), nullable=True))
    op.add_column('bills', sa.Column('recurrence_index', sa.Integer(), nullable=True))
    op.create_index('ix_bills_recurrence_group_id', 'bills', ['recurrence_group_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_bills_recurrence_group_id', table_name='bills')
    op.drop_column('bills', 'recurrence_index')
    op.drop_column('bills', 'recurrence_total')
    op.drop_column('bills', 'recurrence_interval_days')
    op.drop_column('bills', 'recurrence_group_id')
    op.drop_column('bills', 'is_recurring')
