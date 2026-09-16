from fastapi import (
    APIRouter,
    Query,
)

from app.schemas.knowledge import (
    PolicySearchResponse,
)

from app.services.knowledge_service import (
    KnowledgeService,
)


router = APIRouter(
    prefix="/api/v1/knowledge",
    tags=["Knowledge"],
)


@router.get(
    "/search",
    response_model=PolicySearchResponse,
)
def search_policies(

    q: str = Query(
        min_length=3,
        max_length=500,
    ),

    limit: int = Query(
        default=5,
        ge=1,
        le=10,
    ),

    category: str | None = None,
):

    matches = KnowledgeService.search(
        query=q,
        limit=limit,
        category=category,
    )


    return PolicySearchResponse(
        query=q,
        total_results=len(matches),
        items=matches,
    )
