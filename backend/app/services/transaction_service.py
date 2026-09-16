import uuid

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Transaction
from app.repositories.customer_repository import CustomerRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate


ALLOWED_TRANSACTION_TYPES = {
    "card_payment",
    "ach_transfer",
    "wire_transfer",
    "cash_withdrawal",
    "account_transfer",
}


ALLOWED_STATUSES = {
    "completed",
    "pending",
    "failed",
}


class TransactionService:

    @staticmethod
    def create_transaction(
        db: Session,
        payload: TransactionCreate,
    ) -> Transaction:

        customer = (
            CustomerRepository.get_by_ref(
                db,
                payload.customer_ref,
            )
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found.",
            )

        transaction_type = (
            payload.transaction_type
            .strip()
            .lower()
        )

        if (
            transaction_type
            not in ALLOWED_TRANSACTION_TYPES
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid transaction type. "
                    f"Allowed values: "
                    f"{sorted(ALLOWED_TRANSACTION_TYPES)}"
                ),
            )

        status = (
            payload.status
            .strip()
            .lower()
        )

        if status not in ALLOWED_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid transaction status. "
                    f"Allowed values: "
                    f"{sorted(ALLOWED_STATUSES)}"
                ),
            )

        transaction_ref = (
            "TXN-"
            + uuid.uuid4()
            .hex[:12]
            .upper()
        )

        transaction = Transaction(
            transaction_ref=transaction_ref,
            customer_id=customer.id,
            amount=payload.amount,
            currency=(
                payload.currency
                .strip()
                .upper()
            ),
            transaction_type=transaction_type,
            origin_country=(
                payload.origin_country
                .strip()
                .upper()
            ),
            destination_country=(
                payload.destination_country
                .strip()
                .upper()
            ),
            status=status,
            occurred_at=payload.occurred_at,
        )

        try:
            return TransactionRepository.create(
                db,
                transaction,
            )

        except IntegrityError:
            db.rollback()

            raise HTTPException(
                status_code=409,
                detail="Transaction could not be created.",
            )


    @staticmethod
    def get_transaction(
        db: Session,
        transaction_ref: str,
    ) -> Transaction:

        transaction = (
            TransactionRepository.get_by_ref(
                db,
                transaction_ref,
            )
        )

        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found.",
            )

        return transaction
