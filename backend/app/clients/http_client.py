import logging
import time

import httpx


logger = logging.getLogger(
    __name__
)


RETRYABLE_STATUS_CODES = {
    429,
    500,
    502,
    503,
    504,
}


def request_with_retry(
    method: str,
    url: str,
    *,
    retries: int = 2,
    timeout: float = 10.0,
    **kwargs,
) -> httpx.Response:

    last_exception = None


    for attempt in range(
        retries + 1
    ):

        try:

            with httpx.Client(
                timeout=timeout
            ) as client:

                response = client.request(
                    method,
                    url,
                    **kwargs,
                )


            if (
                response.status_code
                not in
                RETRYABLE_STATUS_CODES
            ):

                return response


            if attempt >= retries:

                return response


            logger.warning(
                "External request retry",
                extra={
                    "status_code":
                        response.status_code,

                    "path":
                        url,
                },
            )


        except (
            httpx.TimeoutException,
            httpx.TransportError,
        ) as exc:

            last_exception = exc


            if attempt >= retries:
                raise


        delay = (
            0.25
            * (
                2 ** attempt
            )
        )

        time.sleep(
            delay
        )


    if last_exception:
        raise last_exception


    raise RuntimeError(
        "HTTP retry loop ended unexpectedly."
    )
