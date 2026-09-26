"""init schema

Revision ID: a1e72c6d7e63
Revises:
Create Date: 2026-09-26 10:10:54.312623

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1e72c6d7e63'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

location_type = sa.Enum("INTERNAL", "VENDOR", "CUSTOMER", "ADJUSTMENT", name="location_type")
contact_kind = sa.Enum("VENDOR", "CUSTOMER", name="contact_kind")
operation_type = sa.Enum("IN", "OUT", "ADJ", name="operation_type")
operation_status = sa.Enum("DRAFT", "WAITING", "READY", "DONE", "CANCELLED", name="operation_status")


def upgrade() -> None:
    bind = op.get_bind()
    location_type.create(bind, checkfirst=True)
    contact_kind.create(bind, checkfirst=True)
    operation_type.create(bind, checkfirst=True)
    operation_status.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("login_id", sa.String(length=12), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_users_login_id", "users", ["login_id"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "warehouses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("short_code", sa.String(length=20), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=True),
    )
    op.create_index("ix_warehouses_short_code", "warehouses", ["short_code"], unique=True)

    op.create_table(
        "contacts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("kind", contact_kind, nullable=False),
        sa.Column("address", sa.String(length=500), nullable=True),
    )

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("sku", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("unit_cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("uom", sa.String(length=20), nullable=False, server_default="unit"),
    )
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)

    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("short_code", sa.String(length=20), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("type", location_type, nullable=False),
        sa.UniqueConstraint("warehouse_id", "short_code", name="uq_location_short_code_per_warehouse"),
    )

    op.create_table(
        "stock_quants",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.UniqueConstraint("product_id", "location_id", name="uq_quant_product_location"),
    )

    op.create_table(
        "operations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("reference", sa.String(length=30), nullable=False),
        sa.Column("type", operation_type, nullable=False),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=False),
        sa.Column("contact_id", sa.Integer(), sa.ForeignKey("contacts.id"), nullable=True),
        sa.Column("src_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=False),
        sa.Column("dest_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=False),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("status", operation_status, nullable=False, server_default="DRAFT"),
        sa.Column("responsible_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("done_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_operations_reference", "operations", ["reference"], unique=True)

    op.create_table(
        "operation_lines",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("operation_id", sa.Integer(), sa.ForeignKey("operations.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reserved_qty", sa.Integer(), nullable=False, server_default="0"),
    )

    op.create_table(
        "stock_moves",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("operation_id", sa.Integer(), sa.ForeignKey("operations.id"), nullable=False),
        sa.Column("reference", sa.String(length=30), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("from_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=False),
        sa.Column("to_location_id", sa.Integer(), sa.ForeignKey("locations.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("date", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_stock_moves_reference", "stock_moves", ["reference"], unique=False)

    op.create_table(
        "sequences",
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), primary_key=True),
        sa.Column("op_type", operation_type, primary_key=True),
        sa.Column("next_number", sa.Integer(), nullable=False, server_default="1"),
    )


def downgrade() -> None:
    op.drop_table("sequences")
    op.drop_index("ix_stock_moves_reference", table_name="stock_moves")
    op.drop_table("stock_moves")
    op.drop_table("operation_lines")
    op.drop_index("ix_operations_reference", table_name="operations")
    op.drop_table("operations")
    op.drop_table("stock_quants")
    op.drop_table("locations")
    op.drop_index("ix_products_sku", table_name="products")
    op.drop_table("products")
    op.drop_table("contacts")
    op.drop_index("ix_warehouses_short_code", table_name="warehouses")
    op.drop_table("warehouses")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_login_id", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    operation_status.drop(bind, checkfirst=True)
    operation_type.drop(bind, checkfirst=True)
    contact_kind.drop(bind, checkfirst=True)
    location_type.drop(bind, checkfirst=True)
