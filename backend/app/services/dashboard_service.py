from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai_models import AIExplanation
from app.models import (
    Customer,
    RiskAssessment,
    Transaction,
)


class DashboardService:

    @staticmethod
    def get_overview(
        db: Session,
    ) -> dict:

        transactions_total = (
            db.scalar(
                select(
                    func.count(
                        Transaction.id
                    )
                )
            )
            or 0
        )

        customers_total = (
            db.scalar(
                select(
                    func.count(
                        Customer.id
                    )
                )
            )
            or 0
        )

        assessments_total = (
            db.scalar(
                select(
                    func.count(
                        RiskAssessment.id
                    )
                )
            )
            or 0
        )

        ai_explanations_total = (
            db.scalar(
                select(
                    func.count(
                        AIExplanation.id
                    )
                )
            )
            or 0
        )


        average_risk_score = (
            db.scalar(
                select(
                    func.avg(
                        RiskAssessment.risk_score
                    )
                )
            )
            or 0
        )


        risk_counts = {
            "low": 0,
            "medium": 0,
            "high": 0,
            "critical": 0,
        }


        risk_rows = (
            db.execute(
                select(
                    RiskAssessment.risk_level,
                    func.count(
                        RiskAssessment.id
                    ),
                )
                .group_by(
                    RiskAssessment.risk_level
                )
            )
            .all()
        )


        for level, count in risk_rows:

            normalized = (
                level.lower()
                if level
                else "unknown"
            )

            risk_counts[
                normalized
            ] = int(count)


        high_risk_total = (
            risk_counts.get(
                "high",
                0,
            )
            +
            risk_counts.get(
                "critical",
                0,
            )
        )


        assessment_coverage = (
            (
                assessments_total
                / transactions_total
            )
            * 100
            if transactions_total
            else 0
        )


        ai_coverage = (
            (
                ai_explanations_total
                / assessments_total
            )
            * 100
            if assessments_total
            else 0
        )


        recent_rows = (
            db.execute(
                select(
                    Transaction,
                    RiskAssessment,
                )
                .outerjoin(
                    RiskAssessment,
                    RiskAssessment.transaction_id
                    == Transaction.id,
                )
                .order_by(
                    Transaction.occurred_at.desc()
                )
                .limit(7)
            )
            .all()
        )


        recent_transactions = []


        for transaction, assessment in recent_rows:

            recent_transactions.append({
                "transaction_ref":
                    transaction.transaction_ref,

                "customer_id":
                    str(
                        transaction.customer_id
                    ),

                "amount":
                    str(
                        transaction.amount
                    ),

                "currency":
                    transaction.currency,

                "transaction_type":
                    transaction.transaction_type,

                "origin_country":
                    transaction.origin_country,

                "destination_country":
                    transaction.destination_country,

                "status":
                    transaction.status,

                "occurred_at":
                    transaction
                    .occurred_at
                    .isoformat(),

                "risk_score":
                    (
                        assessment.risk_score
                        if assessment
                        else None
                    ),

                "risk_level":
                    (
                        assessment.risk_level
                        if assessment
                        else "unassessed"
                    ),
            })


        activity_rows = (
            db.execute(
                select(
                    RiskAssessment,
                    Transaction.transaction_ref,
                )
                .join(
                    Transaction,
                    Transaction.id
                    == RiskAssessment.transaction_id,
                )
                .order_by(
                    RiskAssessment.analyzed_at.desc()
                )
                .limit(16)
            )
            .all()
        )


        activity_rows = list(
            reversed(
                activity_rows
            )
        )


        risk_activity = []


        for assessment, transaction_ref in activity_rows:

            risk_activity.append({
                "time":
                    assessment
                    .analyzed_at
                    .strftime(
                        "%H:%M"
                    ),

                "score":
                    assessment.risk_score,

                "level":
                    assessment.risk_level,

                "transaction_ref":
                    transaction_ref,
            })


        return {
            "metrics": {
                "transactions_total":
                    transactions_total,

                "customers_total":
                    customers_total,

                "assessments_total":
                    assessments_total,

                "high_risk_total":
                    high_risk_total,

                "ai_explanations_total":
                    ai_explanations_total,

                "average_risk_score":
                    round(
                        float(
                            average_risk_score
                        ),
                        2,
                    ),

                "assessment_coverage":
                    round(
                        assessment_coverage,
                        2,
                    ),

                "ai_coverage":
                    round(
                        ai_coverage,
                        2,
                    ),
            },

            "risk_distribution":
                risk_counts,

            "risk_activity":
                risk_activity,

            "recent_transactions":
                recent_transactions,
        }
