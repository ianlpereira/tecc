"""epic6_fields

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2025-01-01 00:00:00.000000

Adds:
- bills.recurrence_day_of_month  (F3: fixed day recurrence)
- bills.payment_bank              (F2: payment bank)
- bills.paid_at                   (F2: actual payment date)
- bill_attachments table          (F1: file attachments)
"""

from alembic import op
import sqlalchemy as sa

revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── F3: fixed-day recurrence ──────────────────────────────────────────────
    op.add_column("bills", sa.Column("recurrence_day_of_month", sa.Integer(), nullable=True))

    # ── F2: payment metadata ──────────────────────────────────────────────────
    op.add_column("bills", sa.Column("payment_bank", sa.String(100), nullable=True))
    op.add_column("bills", sa.Column("paid_at", sa.Date(), nullable=True))

    # ── F1: file attachments table ────────────────────────────────────────────
    op.create_table(
        "bill_attachments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "bill_id",
            sa.Integer(),
            sa.ForeignKey("bills.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("file_data", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_bill_attachments_bill_id", "bill_attachments", ["bill_id"])


def downgrade() -> None:
    op.drop_index("ix_bill_attachments_bill_id", table_name="bill_attachments")
    op.drop_table("bill_attachments")
    op.drop_column("bills", "paid_at")
    op.drop_column("bills", "payment_bank")
    op.drop_column("bills", "recurrence_day_of_month")
