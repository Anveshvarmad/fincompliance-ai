from app.compliance.rules import (
    RuleResult,
    evaluate_rules,
)

from app.models import Transaction


def determine_risk_level(
    score: int,
) -> str:

    if score >= 75:
        return "critical"

    if score >= 50:
        return "high"

    if score >= 25:
        return "medium"

    return "low"


def analyze_transaction(
    transaction: Transaction,
) -> tuple[
    int,
    str,
    list[RuleResult],
]:

    matches = evaluate_rules(
        transaction
    )

    score = sum(
        match.points
        for match in matches
    )

    score = min(
        score,
        100,
    )

    risk_level = determine_risk_level(
        score
    )

    return (
        score,
        risk_level,
        matches,
    )
