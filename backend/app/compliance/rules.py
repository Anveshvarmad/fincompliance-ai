from dataclasses import dataclass
from decimal import Decimal

from app.models import Transaction


@dataclass(frozen=True)
class RuleResult:
    code: str
    name: str
    points: int
    reason: str


def evaluate_rules(
    transaction: Transaction,
) -> list[RuleResult]:

    matches: list[RuleResult] = []

    amount = Decimal(transaction.amount)

    if amount >= Decimal("10000"):
        matches.append(
            RuleResult(
                code="HIGH_VALUE_TRANSACTION",
                name="High-value transaction",
                points=30,
                reason=(
                    f"Transaction amount {amount} "
                    "is at or above the 10,000 threshold."
                ),
            )
        )

    if amount >= Decimal("25000"):
        matches.append(
            RuleResult(
                code="VERY_HIGH_VALUE_TRANSACTION",
                name="Very high-value transaction",
                points=20,
                reason=(
                    f"Transaction amount {amount} "
                    "is at or above the 25,000 threshold."
                ),
            )
        )

    if (
        transaction.origin_country
        != transaction.destination_country
    ):
        matches.append(
            RuleResult(
                code="CROSS_BORDER_TRANSACTION",
                name="Cross-border transaction",
                points=20,
                reason=(
                    "Origin country "
                    f"{transaction.origin_country} "
                    "differs from destination country "
                    f"{transaction.destination_country}."
                ),
            )
        )

    if transaction.transaction_type == "wire_transfer":
        matches.append(
            RuleResult(
                code="WIRE_TRANSFER",
                name="Wire transfer",
                points=15,
                reason=(
                    "Transaction uses the wire transfer channel."
                ),
            )
        )

    if (
        transaction.transaction_type
        == "cash_withdrawal"
        and amount >= Decimal("5000")
    ):
        matches.append(
            RuleResult(
                code="LARGE_CASH_WITHDRAWAL",
                name="Large cash withdrawal",
                points=25,
                reason=(
                    "Cash withdrawal is at or above 5,000."
                ),
            )
        )

    if (
        transaction.customer
        and transaction.origin_country
        != transaction.customer.country_code
    ):
        matches.append(
            RuleResult(
                code="CUSTOMER_COUNTRY_MISMATCH",
                name="Customer country mismatch",
                points=15,
                reason=(
                    "Transaction originated in "
                    f"{transaction.origin_country}, "
                    "while the customer's registered country is "
                    f"{transaction.customer.country_code}."
                ),
            )
        )

    return matches
