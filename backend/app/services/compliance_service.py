from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.compliance.engine import (
    analyze_transaction,
)

from app.models import (
    RiskAssessment,
    RuleMatch,
)

from app.repositories.risk_repository import (
    RiskAssessmentRepository,
)

from app.repositories.transaction_repository import (
    TransactionRepository,
)


class ComplianceService:

    @staticmethod
    def analyze(
        db: Session,
        transaction_ref: str,
    ) -> RiskAssessment:

        transaction = (
            TransactionRepository
            .get_by_ref_with_customer(
                db,
                transaction_ref,
            )
        )

        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found.",
            )

        existing = (
            RiskAssessmentRepository
            .get_by_transaction_id(
                db,
                transaction.id,
            )
        )

        if existing:
            return existing

        (
            score,
            level,
            matches,
        ) = analyze_transaction(
            transaction
        )

        assessment = RiskAssessment(
            transaction_id=transaction.id,
            risk_score=score,
            risk_level=level,
            rule_version="v1",
        )

        for match in matches:

            assessment.rule_matches.append(
                RuleMatch(
                    rule_code=match.code,
                    rule_name=match.name,
                    score_contribution=match.points,
                    reason=match.reason,
                )
            )

        try:

            return (
                RiskAssessmentRepository
                .create(
                    db,
                    assessment,
                )
            )

        except IntegrityError:

            db.rollback()

            existing = (
                RiskAssessmentRepository
                .get_by_transaction_id(
                    db,
                    transaction.id,
                )
            )

            if existing:
                return existing

            raise HTTPException(
                status_code=500,
                detail=(
                    "Risk assessment could not be created."
                ),
            )


    @staticmethod
    def get_assessment(
        db: Session,
        transaction_ref: str,
    ) -> RiskAssessment:

        transaction = (
            TransactionRepository
            .get_by_ref(
                db,
                transaction_ref,
            )
        )

        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found.",
            )

        assessment = (
            RiskAssessmentRepository
            .get_by_transaction_id(
                db,
                transaction.id,
            )
        )

        if not assessment:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Transaction has not been analyzed yet."
                ),
            )

        return assessment
