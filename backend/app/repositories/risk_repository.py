from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import (
    Session,
    selectinload,
)

from app.models import (
    RiskAssessment,
)


class RiskAssessmentRepository:

    @staticmethod
    def get_by_transaction_id(
        db: Session,
        transaction_id: UUID,
    ) -> RiskAssessment | None:

        statement = (
            select(RiskAssessment)
            .options(
                selectinload(
                    RiskAssessment.rule_matches
                )
            )
            .where(
                RiskAssessment.transaction_id
                == transaction_id
            )
        )

        return db.scalar(statement)


    @staticmethod
    def create(
        db: Session,
        assessment: RiskAssessment,
    ) -> RiskAssessment:

        db.add(assessment)
        db.commit()

        return (
            RiskAssessmentRepository
            .get_by_transaction_id(
                db,
                assessment.transaction_id,
            )
        )
