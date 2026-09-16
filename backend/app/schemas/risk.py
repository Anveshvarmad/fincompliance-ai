from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
)


class RuleMatchResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    rule_code: str
    rule_name: str
    score_contribution: int
    reason: str


class RiskAssessmentResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    transaction_id: UUID

    risk_score: int
    risk_level: str

    rule_version: str

    analyzed_at: datetime

    rule_matches: list[
        RuleMatchResponse
    ]
