import logging


logger = logging.getLogger(
    __name__
)


def publish_event(
    *,
    event_type: str,
    transaction_ref: str | None = None,
    payload: dict | None = None,
) -> bool:

    """
    Compatibility function.

    Phase 11 event delivery is handled by PostgreSQL
    transactional outbox triggers.

    Business services still call this function so
    existing application code does not need to change,
    but no network request occurs here.
    """

    logger.debug(
        "Direct event publication skipped; "
        "transactional outbox handles delivery.",
        extra={
            "path":
                event_type,
        },
    )

    return True
