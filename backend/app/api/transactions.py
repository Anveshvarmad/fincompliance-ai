from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.repositories.customer_repository import CustomerRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import (
    TransactionCreate,
    TransactionListResponse,
    TransactionResponse,
)
from app.services.transaction_service import TransactionService


router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=201,
)
def create_transaction(
    payload: TransactionCreate,

    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return TransactionService.create_transaction(
        db,
        payload,
    )


@router.get(
    "",
    response_model=TransactionListResponse,
)
def list_transactions(
    db: Annotated[
        Session,
        Depends(get_db),
    ],

    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    offset: int = Query(
        default=0,
        ge=0,
    ),

    customer_ref: str | None = None,

    status: str | None = None,

    transaction_type: str | None = None,

    origin_country: str | None = None,

    destination_country: str | None = None,

    min_amount: Decimal | None = Query(
        default=None,
        ge=0,
    ),

    max_amount: Decimal | None = Query(
        default=None,
        ge=0,
    ),
):

    customer_id = None

    if customer_ref:

        customer = (
            CustomerRepository.get_by_ref(
                db,
                customer_ref,
            )
        )

        if not customer:
            return TransactionListResponse(
                total=0,
                limit=limit,
                offset=offset,
                items=[],
            )

        customer_id = customer.id


    total, transactions = (
        TransactionRepository.list(
            db=db,
            limit=limit,
            offset=offset,
            customer_id=customer_id,
            status=(
                status.lower()
                if status
                else None
            ),
            transaction_type=(
                transaction_type.lower()
                if transaction_type
                else None
            ),
            origin_country=(
                origin_country.upper()
                if origin_country
                else None
            ),
            destination_country=(
                destination_country.upper()
                if destination_country
                else None
            ),
            min_amount=min_amount,
            max_amount=max_amount,
        )
    )

    return TransactionListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=transactions,
    )


@router.get(
    "/{transaction_ref}",
    response_model=TransactionResponse,
)
def get_transaction(
    transaction_ref: str,

    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return TransactionService.get_transaction(
        db,
        transaction_ref,
    )
