from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PolicySourceResponse(BaseModel):
    policy_id: str
    title: str
    category: str
    chunk_id: str
    distance: float


class AIExplanationResponse(BaseModel):

    id: UUID

    transaction_ref: str

    assessment_id: UUID

    risk_score: int

    risk_level: str

    model_name: str

    prompt_version: str

    summary: str

    rationale: str

    recommended_action: str

    policy_sources: list[
        PolicySourceResponse
    ]

    generated_at: datetime
