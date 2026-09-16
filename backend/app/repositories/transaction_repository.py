from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import (
    Session,
    selectinload,
)

from app.models import Transaction


class TransactionRepository:

    @staticmethod
    def create(
        db: Session,
        transaction: Transaction,
    ) -> Transaction:

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction


    @staticmethod
    def get_by_ref(
        db: Session,
        transaction_ref: str,
    ) -> Transaction | None:

        statement = (
            select(Transaction)
            .where(
                Transaction.transaction_ref
                == transaction_ref
            )
        )

        return db.scalar(statement)


    @staticmethod
    def get_by_ref_with_customer(
        db: Session,
        transaction_ref: str,
    ) -> Transaction | None:

        statement = (
            select(Transaction)
            .options(
                selectinload(
                    Transaction.customer
                )
            )
            .where(
                Transaction.transaction_ref
                == transaction_ref
            )
        )

        return db.scalar(statement)


    @staticmethod
    def list(
        db: Session,
        limit: int,
        offset: int,
        customer_id=None,
        status: str | None = None,
        transaction_type: str | None = None,
        origin_country: str | None = None,
        destination_country: str | None = None,
        min_amount: Decimal | None = None,
        max_amount: Decimal | None = None,
    ) -> tuple[int, list[Transaction]]:

        filters = []

        if customer_id:
            filters.append(
                Transaction.customer_id
                == customer_id
            )

        if status:
            filters.append(
                Transaction.status
                == status
            )

        if transaction_type:
            filters.append(
                Transaction.transaction_type
                == transaction_type
            )

        if origin_country:
            filters.append(
                Transaction.origin_country
                == origin_country
            )

        if destination_country:
            filters.append(
                Transaction.destination_country
                == destination_country
            )

        if min_amount is not None:
            filters.append(
                Transaction.amount
                >= min_amount
            )

        if max_amount is not None:
            filters.append(
                Transaction.amount
                <= max_amount
            )

        count_statement = (
            select(
                func.count(Transaction.id)
            )
            .where(*filters)
        )

        total = (
            db.scalar(count_statement)
            or 0
        )

        statement = (
            select(Transaction)
            .where(*filters)
            .order_by(
                Transaction.occurred_at.desc()
            )
            .limit(limit)
            .offset(offset)
        )

        transactions = list(
            db.scalars(statement)
        )

        return (
            total,
            transactions,
        )
