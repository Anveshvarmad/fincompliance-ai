from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Customer


class CustomerRepository:

    @staticmethod
    def create(
        db: Session,
        customer: Customer,
    ) -> Customer:

        db.add(customer)
        db.commit()
        db.refresh(customer)

        return customer


    @staticmethod
    def get_by_ref(
        db: Session,
        customer_ref: str,
    ) -> Customer | None:

        statement = (
            select(Customer)
            .where(
                Customer.customer_ref
                == customer_ref
            )
        )

        return db.scalar(statement)


    @staticmethod
    def list(
        db: Session,
        limit: int,
        offset: int,
        country_code: str | None = None,
        segment: str | None = None,
    ) -> tuple[int, list[Customer]]:

        filters = []

        if country_code:
            filters.append(
                Customer.country_code
                == country_code
            )

        if segment:
            filters.append(
                Customer.segment
                == segment
            )

        count_statement = (
            select(
                func.count(Customer.id)
            )
            .where(*filters)
        )

        total = db.scalar(
            count_statement
        ) or 0

        statement = (
            select(Customer)
            .where(*filters)
            .order_by(
                Customer.created_at.desc()
            )
            .limit(limit)
            .offset(offset)
        )

        customers = list(
            db.scalars(statement)
        )

        return total, customers
