"""
Pydantic schemas package.
"""

from app.schemas.base import BaseSchema, TimestampedSchema
from app.schemas.branch import (
    BranchBase,
    BranchCreate,
    BranchUpdate,
    BranchResponse,
)
from app.schemas.vendor import (
    VendorBase,
    VendorCreate,
    VendorUpdate,
    VendorResponse,
)
from app.schemas.category import (
    CategoryBase,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)
from app.schemas.bill import (
    BillBase,
    BillCreate,
    BillUpdate,
    BillResponse,
    BillRecurrenceUpdate,
    BatchDeleteRequest,
    BatchMarkPaidRequest,
    BatchDeleteResponse,
    BatchMarkPaidResponse,
    DueTodaySummary,
    BillReportRow,
    BillReportSummary,
    BillReportResponse,
)
from app.schemas.bill_attachment import (
    BillAttachmentResponse,
    BillAttachmentWithData,
)
from app.schemas.vehicle import (
    VehicleBase,
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
)
from app.schemas.payment_method import (
    PaymentMethodCreate,
    PaymentMethodUpdate,
    PaymentMethodResponse,
)

__all__ = [
    "BaseSchema",
    "TimestampedSchema",
    "BranchBase",
    "BranchCreate",
    "BranchUpdate",
    "BranchResponse",
    "VendorBase",
    "VendorCreate",
    "VendorUpdate",
    "VendorResponse",
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "BillBase",
    "BillCreate",
    "BillUpdate",
    "BillResponse",
    "BillAttachmentResponse",
    "BillAttachmentWithData",
    "VehicleBase",
    "VehicleCreate",
    "VehicleUpdate",
    "VehicleResponse",
    "PaymentMethodCreate",
    "PaymentMethodUpdate",
    "PaymentMethodResponse",
]
