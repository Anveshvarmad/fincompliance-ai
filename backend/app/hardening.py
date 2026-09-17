import logging
import os
import threading
import time
import uuid
from collections import (
    defaultdict,
    deque,
)

from fastapi import (
    Request,
)

from fastapi.exceptions import (
    RequestValidationError,
)

from fastapi.responses import (
    JSONResponse,
)

from starlette.exceptions import (
    HTTPException as StarletteHTTPException,
)

from starlette.middleware.base import (
    BaseHTTPMiddleware,
)

from app.logging_config import (
    configure_logging,
)


logger = logging.getLogger(
    "fincompliance.request"
)


class SecurityMiddleware(
    BaseHTTPMiddleware
):

    def __init__(
        self,
        app,
    ):

        super().__init__(
            app
        )

        self.limit = int(
            os.getenv(
                "RATE_LIMIT_PER_MINUTE",
                "300",
            )
        )

        self.windows = defaultdict(
            deque
        )

        self.lock = (
            threading.Lock()
        )


    def _rate_limit_key(
        self,
        request: Request,
    ) -> str:

        auth = request.headers.get(
            "authorization"
        )


        if auth:

            return (
                "token:"
                + str(
                    hash(auth)
                )
            )


        if request.client:

            return (
                "ip:"
                + request.client.host
            )


        return "unknown"


    def _allowed(
        self,
        request: Request,
    ) -> bool:

        if request.url.path in {
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
        }:

            return True


        now = time.time()

        key = self._rate_limit_key(
            request
        )


        with self.lock:

            bucket = self.windows[
                key
            ]


            while (
                bucket
                and bucket[0]
                <= now - 60
            ):

                bucket.popleft()


            if (
                len(bucket)
                >= self.limit
            ):

                return False


            bucket.append(
                now
            )


        return True


    async def dispatch(
        self,
        request: Request,
        call_next,
    ):

        request_id = (
            request.headers.get(
                "X-Request-ID"
            )
            or str(
                uuid.uuid4()
            )
        )


        request.state.request_id = (
            request_id
        )


        if not self._allowed(
            request
        ):

            response = JSONResponse(
                status_code=429,
                content={
                    "detail":
                        "Rate limit exceeded.",

                    "request_id":
                        request_id,
                },
            )

            response.headers[
                "Retry-After"
            ] = "60"

            response.headers[
                "X-Request-ID"
            ] = request_id

            return response


        start = time.perf_counter()


        response = await call_next(
            request
        )


        duration_ms = round(
            (
                time.perf_counter()
                - start
            )
            * 1000,
            2,
        )


        response.headers[
            "X-Request-ID"
        ] = request_id

        response.headers[
            "X-Content-Type-Options"
        ] = "nosniff"

        response.headers[
            "X-Frame-Options"
        ] = "DENY"

        response.headers[
            "Referrer-Policy"
        ] = "no-referrer"

        response.headers[
            "Permissions-Policy"
        ] = (
            "camera=(), "
            "microphone=(), "
            "geolocation=()"
        )


        logger.info(
            "HTTP request completed",
            extra={
                "request_id":
                    request_id,

                "method":
                    request.method,

                "path":
                    request.url.path,

                "status_code":
                    response.status_code,

                "duration_ms":
                    duration_ms,

                "client_ip":
                    (
                        request.client.host
                        if request.client
                        else None
                    ),
            },
        )


        return response


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
):

    request_id = getattr(
        request.state,
        "request_id",
        None,
    )


    return JSONResponse(
        status_code=
            exc.status_code,

        headers=
            exc.headers,

        content={
            "detail":
                exc.detail,

            "request_id":
                request_id,

            "error": {
                "type":
                    "http_error",

                "status":
                    exc.status_code,
            },
        },
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):

    request_id = getattr(
        request.state,
        "request_id",
        None,
    )


    return JSONResponse(
        status_code=422,

        content={
            "detail":
                "Request validation failed.",

            "request_id":
                request_id,

            "error": {
                "type":
                    "validation_error",

                "issues":
                    exc.errors(),
            },
        },
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
):

    request_id = getattr(
        request.state,
        "request_id",
        None,
    )


    logger.exception(
        "Unhandled application error",
        extra={
            "request_id":
                request_id,

            "method":
                request.method,

            "path":
                request.url.path,
        },
    )


    return JSONResponse(
        status_code=500,

        content={
            "detail":
                "Internal server error.",

            "request_id":
                request_id,

            "error": {
                "type":
                    "internal_error",
            },
        },
    )


def install_hardening(
    app,
):

    configure_logging()


    app.add_middleware(
        SecurityMiddleware
    )


    app.add_exception_handler(
        StarletteHTTPException,
        http_exception_handler,
    )


    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,
    )


    app.add_exception_handler(
        Exception,
        generic_exception_handler,
    )
