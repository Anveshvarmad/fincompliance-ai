from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TransactionCreate(BaseModel):
    customer_ref: str

    amount: Decimal = Field(
        gt=0,
        decimal_places=2,
    )

    currency: str = Field(
        min_length=3,
        max_length=3,
    )

    transaction_type: str = Field(
        min_length=3,
        max_length=30,
    )

    origin_country: str = Field(
        min_length=2,
        max_length=2,
    )

    destination_country: str = Field(
        min_length=2,
        max_length=2,
    )

    status: str = Field(
        default="completed",
        max_length=20,
    )

    occurred_at: datetime


class TransactionResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    transaction_ref: str

    customer_id: UUID

    amount: Decimal
    currency: str

    transaction_type: str

    origin_country: str
    destination_country: str

    status: str

    occurred_at: datetime
    created_at: datetime


class TransactionListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[TransactionResponse]
