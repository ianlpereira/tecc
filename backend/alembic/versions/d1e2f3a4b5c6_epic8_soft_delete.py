"""epic8_soft_delete

Revision ID: d1e2f3a4b5c6
Revises: 910719ade46b
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, None] = '0f1f3b804c93'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Add deleted_at column to all main tables
    for table in ('branches', 'vendors', 'categories', 'vehicles', 'bills'):
        op.add_column(
            table,
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
        )
        op.create_index(
            f'ix_{table}_deleted_at',
            table,
            ['deleted_at'],
        )

    # Drop unique constraints on name/plate columns — uniqueness is now
    # enforced at query level by filtering deleted_at IS NULL.
    # NOTE: constraint names may differ across environments.
    with op.batch_alter_table('branches') as batch_op:
        try:
            batch_op.drop_constraint('branches_name_key', type_='unique')
        except Exception:
            pass  # constraint may not exist (e.g. already dropped or named differently)

    with op.batch_alter_table('vendors') as batch_op:
        try:
            batch_op.drop_constraint('vendors_name_key', type_='unique')
        except Exception:
            pass

    with op.batch_alter_table('categories') as batch_op:
        try:
            batch_op.drop_constraint('categories_name_key', type_='unique')
        except Exception:
            pass

    with op.batch_alter_table('vehicles') as batch_op:
        try:
            batch_op.drop_constraint('vehicles_plate_key', type_='unique')
        except Exception:
            pass


def downgrade() -> None:
    # Re-add unique constraints (may fail if duplicate values were introduced)
    with op.batch_alter_table('vehicles') as batch_op:
        batch_op.create_unique_constraint('vehicles_plate_key', ['plate'])

    with op.batch_alter_table('categories') as batch_op:
        batch_op.create_unique_constraint('categories_name_key', ['name'])

    with op.batch_alter_table('vendors') as batch_op:
        batch_op.create_unique_constraint('vendors_name_key', ['name'])

    with op.batch_alter_table('branches') as batch_op:
        batch_op.create_unique_constraint('branches_name_key', ['name'])

    # Drop deleted_at columns
    for table in ('bills', 'vehicles', 'categories', 'vendors', 'branches'):
        op.drop_index(f'ix_{table}_deleted_at', table_name=table)
        op.drop_column(table, 'deleted_at')
