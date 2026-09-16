from typing import Sequence

import httpx

from app.settings import settings


class OllamaEmbeddingError(
    RuntimeError
):
    pass


def embed_texts(
    texts: Sequence[str],
) -> list[list[float]]:

    if not texts:
        return []

    payload = {
        "model":
            settings.ollama_embedding_model,

        "input":
            list(texts),
    }

    try:

        with httpx.Client(
            timeout=60.0
        ) as client:

            response = client.post(
                (
                    f"{settings.ollama_base_url}"
                    "/api/embed"
                ),
                json=payload,
            )

            response.raise_for_status()

    except httpx.HTTPError as exc:

        raise OllamaEmbeddingError(
            f"Embedding request failed: {exc}"
        ) from exc


    data = response.json()

    embeddings = data.get(
        "embeddings"
    )


    if not embeddings:

        raise OllamaEmbeddingError(
            "Ollama returned no embeddings."
        )


    if len(embeddings) != len(texts):

        raise OllamaEmbeddingError(
            "Embedding count does not match input count."
        )


    return embeddings
