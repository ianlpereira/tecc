"""add_deleted_at_to_bill_attachments

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-03-24 00:00:00.000000

Hotfix: bill_attachments herdou deleted_at do BaseModel mas a coluna
não estava incluída na migration do Epic 8 (d1e2f3a4b5c6).
"""
from typing import Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2f3a4b5c6d7'
down_revision: Union[str, None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    op.add_column(
        'bill_attachments',
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_bill_attachments_deleted_at', 'bill_attachments', ['deleted_at'])


def downgrade() -> None:
    op.drop_index('ix_bill_attachments_deleted_at', table_name='bill_attachments')
    op.drop_column('bill_attachments', 'deleted_at')
