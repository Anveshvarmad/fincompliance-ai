from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.dependencies import (
    get_db,
)

from app.schemas.ai import (
    AIExplanationResponse,
)

from app.services.ai_service import (
    AIService,
)


router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"],
)


@router.post(
    "/transactions/{transaction_ref}/explain",
    response_model=AIExplanationResponse,
)
def generate_explanation(
    transaction_ref: str,

    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return (
        AIService.generate_explanation(
            db,
            transaction_ref,
        )
    )


@router.get(
    "/transactions/{transaction_ref}/explanation",
    response_model=AIExplanationResponse,
)
def get_explanation(
    transaction_ref: str,

    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return AIService.get_explanation(
        db,
        transaction_ref,
    )
