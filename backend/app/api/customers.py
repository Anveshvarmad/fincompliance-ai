from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerResponse,
)
from app.services.customer_service import CustomerService


router = APIRouter(
    prefix="/api/v1/customers",
    tags=["Customers"],
)


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=201,
)
def create_customer(
    payload: CustomerCreate,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return CustomerService.create_customer(
        db,
        payload,
    )


@router.get(
    "",
    response_model=CustomerListResponse,
)
def list_customers(
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

    country_code: str | None = None,

    segment: str | None = None,
):

    if country_code:
        country_code = (
            country_code
            .strip()
            .upper()
        )

    if segment:
        segment = (
            segment
            .strip()
            .lower()
        )

    total, customers = (
        CustomerRepository.list(
            db=db,
            limit=limit,
            offset=offset,
            country_code=country_code,
            segment=segment,
        )
    )

    return CustomerListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=customers,
    )


@router.get(
    "/{customer_ref}",
    response_model=CustomerResponse,
)
def get_customer(
    customer_ref: str,

    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return CustomerService.get_customer(
        db,
        customer_ref,
    )
