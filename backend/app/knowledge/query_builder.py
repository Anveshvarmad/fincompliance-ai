from app.models import (
    RiskAssessment,
    Transaction,
)


def build_policy_query(
    *,
    transaction: Transaction,
    assessment: RiskAssessment,
) -> str:

    matched_rules = ", ".join(
        match.rule_name
        for match
        in assessment.rule_matches
    )

    if not matched_rules:
        matched_rules = (
            "no specific risk rules matched"
        )


    return (
        f"Transaction type: "
        f"{transaction.transaction_type}. "

        f"Amount: "
        f"{transaction.amount} "
        f"{transaction.currency}. "

        f"Origin country: "
        f"{transaction.origin_country}. "

        f"Destination country: "
        f"{transaction.destination_country}. "

        f"Risk level: "
        f"{assessment.risk_level}. "

        f"Matched risk indicators: "
        f"{matched_rules}. "

        "Find compliance policies relevant "
        "to reviewing this transaction."
    )
