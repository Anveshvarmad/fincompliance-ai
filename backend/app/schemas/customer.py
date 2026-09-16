from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CustomerCreate(BaseModel):
    customer_ref: str | None = Field(
        default=None,
        min_length=3,
        max_length=32,
    )

    full_name: str = Field(
        min_length=2,
        max_length=120,
    )

    country_code: str = Field(
        min_length=2,
        max_length=2,
    )

    segment: str = Field(
        min_length=2,
        max_length=30,
    )


class CustomerResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    customer_ref: str
    full_name: str
    country_code: str
    segment: str
    created_at: datetime


class CustomerListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[CustomerResponse]
