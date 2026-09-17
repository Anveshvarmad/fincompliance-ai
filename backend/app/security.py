import base64
import hashlib
import hmac
import os
from datetime import (
    datetime,
    timedelta,
    timezone,
)

import jwt

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)


bearer_scheme = HTTPBearer(
    auto_error=False
)


ROLE_LEVELS = {
    "viewer":
        1,

    "analyst":
        2,

    "admin":
        3,
}


def _user_records():

    records = {}


    for role in [
        "viewer",
        "analyst",
        "admin",
    ]:

        prefix = role.upper()

        username = os.getenv(
            f"AUTH_{prefix}_USERNAME"
        )

        salt = os.getenv(
            f"AUTH_{prefix}_PASSWORD_SALT"
        )

        password_hash = os.getenv(
            f"AUTH_{prefix}_PASSWORD_HASH"
        )


        if (
            username
            and salt
            and password_hash
        ):

            records[
                username
            ] = {
                "username":
                    username,

                "role":
                    role,

                "salt":
                    salt,

                "password_hash":
                    password_hash,
            }


    return records


def verify_password(
    password: str,
    record: dict,
) -> bool:

    try:

        salt = (
            base64
            .urlsafe_b64decode(
                record["salt"]
            )
        )

        expected = (
            base64
            .urlsafe_b64decode(
                record[
                    "password_hash"
                ]
            )
        )

    except Exception:

        return False


    actual = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        200_000,
    )


    return hmac.compare_digest(
        actual,
        expected,
    )


def authenticate_user(
    username: str,
    password: str,
) -> dict | None:

    record = _user_records().get(
        username
    )


    if not record:

        return None


    if not verify_password(
        password,
        record,
    ):

        return None


    return {
        "username":
            record["username"],

        "role":
            record["role"],
    }


def create_access_token(
    user: dict,
) -> str:

    secret = os.getenv(
        "JWT_SECRET"
    )


    if not secret:

        raise RuntimeError(
            "JWT_SECRET is not configured."
        )


    algorithm = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )


    expire_minutes = int(
        os.getenv(
            "JWT_EXPIRE_MINUTES",
            "60",
        )
    )


    issuer = os.getenv(
        "AUTH_ISSUER",
        "fincompliance-ai",
    )


    now = datetime.now(
        timezone.utc
    )


    payload = {
        "sub":
            user["username"],

        "role":
            user["role"],

        "iat":
            now,

        "exp":
            now
            + timedelta(
                minutes=expire_minutes
            ),

        "iss":
            issuer,
    }


    return jwt.encode(
        payload,
        secret,
        algorithm=algorithm,
    )


def decode_access_token(
    token: str,
) -> dict:

    secret = os.getenv(
        "JWT_SECRET"
    )


    algorithm = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )


    issuer = os.getenv(
        "AUTH_ISSUER",
        "fincompliance-ai",
    )


    try:

        return jwt.decode(
            token,
            secret,
            algorithms=[
                algorithm
            ],
            issuer=issuer,
        )

    except jwt.ExpiredSignatureError as exc:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Authentication token has expired.",

            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        ) from exc

    except jwt.InvalidTokenError as exc:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid authentication token.",

            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        ) from exc


def get_current_user(
    credentials:
        HTTPAuthorizationCredentials
        | None
        = Depends(
            bearer_scheme
        ),
) -> dict:

    if not credentials:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Authentication required.",

            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )


    payload = decode_access_token(
        credentials.credentials
    )


    username = payload.get(
        "sub"
    )

    role = payload.get(
        "role"
    )


    if (
        not username
        or role not in ROLE_LEVELS
    ):

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid authentication payload.",
        )


    return {
        "username":
            username,

        "role":
            role,
    }


def require_role(
    minimum_role: str,
):

    minimum_level = ROLE_LEVELS[
        minimum_role
    ]


    def dependency(
        user: dict = Depends(
            get_current_user
        ),
    ) -> dict:

        user_level = ROLE_LEVELS.get(
            user["role"],
            0,
        )


        if user_level < minimum_level:

            raise HTTPException(
                status_code=
                    status.HTTP_403_FORBIDDEN,

                detail=(
                    f"{minimum_role} role "
                    "or higher is required."
                ),
            )


        return user


    return dependency


require_viewer = require_role(
    "viewer"
)

require_analyst = require_role(
    "analyst"
)

require_admin = require_role(
    "admin"
)
