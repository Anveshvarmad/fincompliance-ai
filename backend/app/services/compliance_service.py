from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.clients.event_client import publish_event
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

            created_assessment = (
                RiskAssessmentRepository
                .create(
                    db,
                    assessment,
                )
            )

            publish_event(
                event_type=(
                    "RISK_ASSESSMENT_CREATED"
                ),
                transaction_ref=(
                    transaction.transaction_ref
                ),
                payload={
                    "risk_score":
                        created_assessment
                        .risk_score,

                    "risk_level":
                        created_assessment
                        .risk_level,

                    "rule_version":
                        created_assessment
                        .rule_version,

                    "matched_rules": [
                        {
                            "rule_code":
                                match.rule_code,

                            "score_contribution":
                                match.score_contribution,
                        }

                        for match
                        in (
                            created_assessment
                            .rule_matches
                        )
                    ],
                },
            )

            return created_assessment

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
