from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.dashboard_service import (
    DashboardService,
)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/overview"
)
def get_dashboard_overview(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):

    return (
        DashboardService
        .get_overview(
            db
        )
    )
