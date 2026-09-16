import uuid

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Customer
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import CustomerCreate


ALLOWED_SEGMENTS = {
    "retail",
    "small_business",
    "corporate",
    "private_banking",
}


class CustomerService:

    @staticmethod
    def create_customer(
        db: Session,
        payload: CustomerCreate,
    ) -> Customer:

        country_code = (
            payload.country_code
            .strip()
            .upper()
        )

        segment = (
            payload.segment
            .strip()
            .lower()
        )

        if segment not in ALLOWED_SEGMENTS:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid customer segment. "
                    f"Allowed values: "
                    f"{sorted(ALLOWED_SEGMENTS)}"
                ),
            )

        customer_ref = (
            payload.customer_ref
            or (
                "CUS-"
                + uuid.uuid4()
                .hex[:10]
                .upper()
            )
        )

        existing = (
            CustomerRepository.get_by_ref(
                db,
                customer_ref,
            )
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Customer reference already exists.",
            )

        customer = Customer(
            customer_ref=customer_ref,
            full_name=payload.full_name.strip(),
            country_code=country_code,
            segment=segment,
        )

        try:
            return CustomerRepository.create(
                db,
                customer,
            )

        except IntegrityError:
            db.rollback()

            raise HTTPException(
                status_code=409,
                detail="Customer already exists.",
            )


    @staticmethod
    def get_customer(
        db: Session,
        customer_ref: str,
    ) -> Customer:

        customer = (
            CustomerRepository.get_by_ref(
                db,
                customer_ref,
            )
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found.",
            )

        return customer
