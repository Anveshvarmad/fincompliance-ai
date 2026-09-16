from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.schemas.risk import (
    RiskAssessmentResponse,
)

from app.services.compliance_service import (
    ComplianceService,
)


router = APIRouter(
    prefix="/api/v1/compliance",
    tags=["Compliance"],
)


@router.post(
    "/transactions/{transaction_ref}/analyze",
    response_model=RiskAssessmentResponse,
)
def analyze_transaction(
    transaction_ref: str,

    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return ComplianceService.analyze(
        db,
        transaction_ref,
    )


@router.get(
    "/transactions/{transaction_ref}/assessment",
    response_model=RiskAssessmentResponse,
)
def get_assessment(
    transaction_ref: str,

    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return ComplianceService.get_assessment(
        db,
        transaction_ref,
    )
