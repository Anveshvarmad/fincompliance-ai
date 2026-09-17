import json
import logging
import os
import sys
from datetime import (
    datetime,
    timezone,
)


class JSONFormatter(
    logging.Formatter
):

    def format(
        self,
        record,
    ) -> str:

        payload = {
            "timestamp":
                datetime.now(
                    timezone.utc
                ).isoformat(),

            "level":
                record.levelname,

            "logger":
                record.name,

            "message":
                record.getMessage(),
        }


        for field in [
            "request_id",
            "method",
            "path",
            "status_code",
            "duration_ms",
            "client_ip",
        ]:

            value = getattr(
                record,
                field,
                None,
            )

            if value is not None:
                payload[field] = value


        if record.exc_info:

            payload[
                "exception"
            ] = self.formatException(
                record.exc_info
            )


        return json.dumps(
            payload,
            default=str,
        )


def configure_logging():

    level_name = os.getenv(
        "LOG_LEVEL",
        "INFO",
    ).upper()


    level = getattr(
        logging,
        level_name,
        logging.INFO,
    )


    handler = logging.StreamHandler(
        sys.stdout
    )

    handler.setFormatter(
        JSONFormatter()
    )


    root = logging.getLogger()

    root.handlers.clear()

    root.addHandler(
        handler
    )

    root.setLevel(
        level
    )
