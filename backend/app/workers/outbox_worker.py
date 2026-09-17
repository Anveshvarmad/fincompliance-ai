import json
import logging
import os
import time

import pika

from sqlalchemy import text

from app.db import engine
from app.logging_config import (
    configure_logging,
)


configure_logging()

logger = logging.getLogger(
    "fincompliance.outbox"
)


RABBITMQ_URL = os.getenv(
    "RABBITMQ_URL",
)

QUEUE_NAME = os.getenv(
    "RABBITMQ_QUEUE",
    "compliance.audit.events",
)


if not RABBITMQ_URL:

    raise RuntimeError(
        "RABBITMQ_URL is not configured."
    )


def rabbit_connection():

    while True:

        try:

            parameters = (
                pika.URLParameters(
                    RABBITMQ_URL
                )
            )

            connection = (
                pika.BlockingConnection(
                    parameters
                )
            )

            channel = (
                connection.channel()
            )

            channel.queue_declare(
                queue=QUEUE_NAME,
                durable=True,
            )

            channel.confirm_delivery()

            logger.info(
                "RabbitMQ publisher connected"
            )

            return (
                connection,
                channel,
            )

        except Exception:

            logger.exception(
                "RabbitMQ connection failed"
            )

            time.sleep(3)


def serialize_event(
    row,
):

    occurred_at = row[
        "occurred_at"
    ]


    return {
        "event_id":
            row["event_id"],

        "event_type":
            row["event_type"],

        "transaction_ref":
            row[
                "transaction_ref"
            ],

        "source":
            row["source"],

        "occurred_at":
            (
                occurred_at.isoformat()
                if occurred_at
                else None
            ),

        "payload":
            row["payload"]
            or {},
    }


def main():

    connection = None
    channel = None


    while True:

        try:

            if (
                connection is None
                or connection.is_closed
                or channel is None
                or channel.is_closed
            ):

                connection, channel = (
                    rabbit_connection()
                )


            with engine.begin() as db:

                row = (
                    db.execute(
                        text(
                            """
                            SELECT
                                id,
                                event_id,
                                event_type,
                                transaction_ref,
                                source,
                                payload,
                                occurred_at
                            FROM outbox_events
                            WHERE published_at
                                  IS NULL
                            ORDER BY id
                            LIMIT 1
                            FOR UPDATE
                            SKIP LOCKED
                            """
                        )
                    )
                    .mappings()
                    .first()
                )


                if not row:

                    time.sleep(0.75)

                    continue


                event = serialize_event(
                    row
                )


                try:

                    channel.basic_publish(
                        exchange="",

                        routing_key=
                            QUEUE_NAME,

                        body=
                            json.dumps(
                                event,
                                default=str,
                            ),

                        properties=
                            pika.BasicProperties(
                                content_type=
                                    "application/json",

                                delivery_mode=
                                    2,

                                message_id=
                                    row["event_id"],

                                type=
                                    row["event_type"],
                            ),

                        mandatory=True,
                    )


                    db.execute(
                        text(
                            """
                            UPDATE outbox_events
                            SET
                                published_at =
                                    NOW(),

                                attempts =
                                    attempts + 1,

                                last_error =
                                    NULL
                            WHERE id = :id
                            """
                        ),
                        {
                            "id":
                                row["id"],
                        },
                    )


                    logger.info(
                        "Outbox event published",
                        extra={
                            "path":
                                row[
                                    "event_type"
                                ],
                        },
                    )


                except Exception as exc:

                    db.execute(
                        text(
                            """
                            UPDATE outbox_events
                            SET
                                attempts =
                                    attempts + 1,

                                last_error =
                                    :error
                            WHERE id = :id
                            """
                        ),
                        {
                            "id":
                                row["id"],

                            "error":
                                str(exc)[
                                    :1000
                                ],
                        },
                    )


                    logger.exception(
                        "Outbox publish failed"
                    )


                    try:

                        connection.close()

                    except Exception:
                        pass


                    connection = None
                    channel = None

                    time.sleep(2)


        except Exception:

            logger.exception(
                "Outbox worker iteration failed"
            )

            try:

                if connection:
                    connection.close()

            except Exception:
                pass


            connection = None
            channel = None

            time.sleep(2)


if __name__ == "__main__":
    main()
