import logging
import uuid
from datetime import datetime, timezone
from typing import Any

import httpx

from app.settings import settings


logger = logging.getLogger(__name__)


def publish_event(
    *,
    event_type: str,
    transaction_ref: str | None,
    payload: dict[str, Any],
    source: str = "fincompliance-backend",
) -> bool:

    event = {
        "event_id": (
            "EVT-"
            + uuid.uuid4()
            .hex
            .upper()
        ),

        "event_type":
            event_type,

        "transaction_ref":
            transaction_ref,

        "source":
            source,

        "occurred_at":
            datetime
            .now(timezone.utc)
            .isoformat(),

        "payload":
            payload,
    }


    try:

        with httpx.Client(
            timeout=3.0
        ) as client:

            response = client.post(
                (
                    f"{settings.event_service_url}"
                    "/events"
                ),
                json=event,
            )


        response.raise_for_status()

        return True


    except Exception:

        logger.exception(
            "Failed to publish audit event: %s",
            event_type,
        )

        return False
