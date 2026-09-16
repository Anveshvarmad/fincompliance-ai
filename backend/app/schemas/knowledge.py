from pydantic import BaseModel


class PolicySearchResult(BaseModel):

    rank: int

    chunk_id: str

    policy_id: str

    title: str

    category: str

    chunk_index: int

    distance: float

    text: str


class PolicySearchResponse(BaseModel):

    query: str

    total_results: int

    items: list[
        PolicySearchResult
    ]
