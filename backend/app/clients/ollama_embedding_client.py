from collections.abc import (
    Sequence,
)

import httpx

from app.clients.http_client import (
    request_with_retry,
)

from app.settings import settings


class OllamaEmbeddingError(
    RuntimeError
):
    pass


def embed_texts(
    texts: Sequence[str],
) -> list[list[float]]:

    clean_texts = [
        text.strip()
        for text in texts
        if text.strip()
    ]


    if not clean_texts:

        return []


    try:

        response = request_with_retry(
            "POST",
            (
                f"{settings.ollama_base_url}"
                "/api/embed"
            ),
            json={
                "model":
                    settings
                    .ollama_embedding_model,

                "input":
                    clean_texts,
            },
            retries=2,
            timeout=60.0,
        )


        response.raise_for_status()


    except httpx.HTTPError as exc:

        raise OllamaEmbeddingError(
            f"Ollama embedding request failed: {exc}"
        ) from exc


    payload = response.json()


    embeddings = payload.get(
        "embeddings"
    )


    if not embeddings:

        raise OllamaEmbeddingError(
            "Ollama returned no embeddings."
        )


    if (
        len(embeddings)
        != len(clean_texts)
    ):

        raise OllamaEmbeddingError(
            "Embedding count does not match input count."
        )


    return embeddings
