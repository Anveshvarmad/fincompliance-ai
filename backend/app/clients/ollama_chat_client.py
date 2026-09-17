import json

import httpx

from app.clients.http_client import (
    request_with_retry,
)

from app.settings import settings


class OllamaChatError(
    RuntimeError
):
    pass


def generate_json_response(
    *,
    system_prompt: str,
    user_prompt: str,
) -> dict:

    payload = {
        "model":
            settings.ollama_model,

        "messages": [
            {
                "role":
                    "system",

                "content":
                    system_prompt,
            },
            {
                "role":
                    "user",

                "content":
                    user_prompt,
            },
        ],

        "stream":
            False,

        "format":
            "json",

        "options": {
            "temperature":
                0.1,
        },
    }


    try:

        response = request_with_retry(
            "POST",
            (
                f"{settings.ollama_base_url}"
                "/api/chat"
            ),
            json=payload,
            retries=2,
            timeout=120.0,
        )


        response.raise_for_status()


    except httpx.HTTPError as exc:

        raise OllamaChatError(
            f"Ollama chat request failed: {exc}"
        ) from exc


    data = response.json()


    try:

        content = (
            data["message"]["content"]
        )

    except KeyError as exc:

        raise OllamaChatError(
            "Ollama response did not contain message content."
        ) from exc


    try:

        return json.loads(
            content
        )

    except json.JSONDecodeError as exc:

        raise OllamaChatError(
            "Ollama returned invalid JSON."
        ) from exc
