import logging
import uuid
from datetime import (
    datetime,
    timezone,
)

import httpx

from app.clients.http_client import (
    request_with_retry,
)

from app.settings import settings


logger = logging.getLogger(
    __name__
)


def publish_event(
    *,
    event_type: str,
    transaction_ref: str | None = None,
    payload: dict | None = None,
) -> bool:

    event = {
        "event_id":
            f"EVT-{uuid.uuid4()}",

        "event_type":
            event_type,

        "transaction_ref":
            transaction_ref,

        "source":
            "fastapi-backend",

        "occurred_at":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "payload":
            payload or {},
    }


    try:

        response = request_with_retry(
            "POST",
            (
                f"{settings.event_service_url}"
                "/events"
            ),
            json=event,
            retries=2,
            timeout=5.0,
        )


        response.raise_for_status()


        return True


    except httpx.HTTPError:

        logger.exception(
            "Audit event publication failed"
        )

        return False
