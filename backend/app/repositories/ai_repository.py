from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai_models import (
    AIExplanation,
)


class AIExplanationRepository:

    @staticmethod
    def get_by_assessment_id(
        db: Session,
        assessment_id: UUID,
    ) -> AIExplanation | None:

        statement = (
            select(AIExplanation)
            .where(
                AIExplanation.assessment_id
                == assessment_id
            )
        )

        return db.scalar(
            statement
        )


    @staticmethod
    def create(
        db: Session,
        explanation: AIExplanation,
    ) -> AIExplanation:

        db.add(
            explanation
        )

        db.commit()

        db.refresh(
            explanation
        )

        return explanation
