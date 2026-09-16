import argparse
import random
import uuid
from datetime import timezone
from decimal import Decimal

from faker import Faker
from sqlalchemy import delete

from app.db import SessionLocal
from app.models import Customer, Transaction


Faker.seed(42)
random.seed(42)

fake = Faker()


COUNTRIES = [
    "US",
    "CA",
    "GB",
    "IN",
    "SG",
    "DE",
    "FR",
    "JP",
    "AU",
    "AE",
]


CURRENCY_BY_COUNTRY = {
    "US": "USD",
    "CA": "CAD",
    "GB": "GBP",
    "IN": "INR",
    "SG": "SGD",
    "DE": "EUR",
    "FR": "EUR",
    "JP": "JPY",
    "AU": "AUD",
    "AE": "AED",
}


CUSTOMER_SEGMENTS = [
    "retail",
    "small_business",
    "corporate",
    "private_banking",
]


TRANSACTION_TYPES = [
    "card_payment",
    "ach_transfer",
    "wire_transfer",
    "cash_withdrawal",
    "account_transfer",
]


TRANSACTION_STATUSES = [
    "completed",
    "pending",
    "failed",
]


def generate_amount() -> Decimal:
    probability = random.random()

    if probability < 0.70:
        value = random.uniform(
            10,
            3000,
        )

    elif probability < 0.90:
        value = random.uniform(
            3000,
            10000,
        )

    else:
        value = random.uniform(
            10000,
            50000,
        )

    return Decimal(
        f"{value:.2f}"
    )


def create_customers(
    session,
    count: int,
):
    customers = []

    print(
        f"Generating {count} synthetic customers..."
    )

    for number in range(
        1,
        count + 1,
    ):
        country = random.choice(
            COUNTRIES
        )

        customer = Customer(
            customer_ref=f"CUS-{number:06d}",
            full_name=fake.name(),
            country_code=country,
            segment=random.choice(
                CUSTOMER_SEGMENTS
            ),
        )

        customers.append(
            customer
        )

    session.add_all(
        customers
    )

    session.commit()

    print(
        f"Created {len(customers)} customers."
    )

    return customers


def choose_destination(
    origin_country: str,
):
    if random.random() < 0.70:
        return origin_country

    alternatives = [
        country
        for country in COUNTRIES
        if country != origin_country
    ]

    return random.choice(
        alternatives
    )


def create_transactions(
    session,
    customers,
    count: int,
    batch_size: int = 1000,
):
    print(
        f"Generating {count} synthetic transactions..."
    )

    batch = []

    for number in range(
        1,
        count + 1,
    ):
        customer = random.choice(
            customers
        )

        origin = customer.country_code

        destination = choose_destination(
            origin
        )

        transaction = Transaction(
            transaction_ref=(
                "TXN-"
                + uuid.uuid4()
                .hex[:12]
                .upper()
            ),

            customer_id=customer.id,

            amount=generate_amount(),

            currency=CURRENCY_BY_COUNTRY[
                origin
            ],

            transaction_type=random.choice(
                TRANSACTION_TYPES
            ),

            origin_country=origin,

            destination_country=destination,

            status=random.choices(
                TRANSACTION_STATUSES,
                weights=[
                    0.92,
                    0.05,
                    0.03,
                ],
                k=1,
            )[0],

            occurred_at=fake.date_time_between(
                start_date="-90d",
                end_date="now",
                tzinfo=timezone.utc,
            ),
        )

        batch.append(
            transaction
        )

        if (
            len(batch) >= batch_size
            or number == count
        ):
            session.add_all(
                batch
            )

            session.commit()

            print(
                f"Inserted {number}/{count} transactions"
            )

            batch.clear()

    print(
        "Transaction generation complete."
    )


def reset_data(
    session,
):
    print(
        "Removing existing synthetic data..."
    )

    session.execute(
        delete(Transaction)
    )

    session.execute(
        delete(Customer)
    )

    session.commit()

    print(
        "Existing data removed."
    )


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--customers",
        type=int,
        default=250,
    )

    parser.add_argument(
        "--transactions",
        type=int,
        default=5000,
    )

    parser.add_argument(
        "--reset",
        action="store_true",
    )

    args = parser.parse_args()

    with SessionLocal() as session:

        if args.reset:
            reset_data(
                session
            )

        customers = create_customers(
            session,
            args.customers,
        )

        create_transactions(
            session,
            customers,
            args.transactions,
        )

    print("")
    print(
        "Synthetic financial dataset created successfully."
    )


if __name__ == "__main__":
    main()
