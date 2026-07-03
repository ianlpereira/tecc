"""add parent branch hierarchy

Revision ID: a1b2c3d4e5f6
Revises: bd8ab0f9fcbf
Create Date: 2026-02-05 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'bd8ab0f9fcbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add parent_branch_id column to branches table for hierarchy support."""
    # Add parent_branch_id column
    op.add_column(
        'branches',
        sa.Column('parent_branch_id', sa.Integer(), nullable=True)
    )
    
    # Create foreign key constraint
    op.create_foreign_key(
        'fk_branches_parent',
        'branches', 
        'branches',
        ['parent_branch_id'], 
        ['id'],
        ondelete='SET NULL'
    )
    
    # Create index for better query performance
    op.create_index(
        'ix_branches_parent_branch_id',
        'branches',
        ['parent_branch_id']
    )


def downgrade() -> None:
    """Remove parent_branch_id column and related constraints."""
    # Drop index
    op.drop_index('ix_branches_parent_branch_id', table_name='branches')
    
    # Drop foreign key
    op.drop_constraint('fk_branches_parent', 'branches', type_='foreignkey')
    
    # Drop column
    op.drop_column('branches', 'parent_branch_id')
