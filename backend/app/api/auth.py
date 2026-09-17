from pydantic import (
    BaseModel,
    Field,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.security import (
    authenticate_user,
    create_access_token,
    get_current_user,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


class LoginRequest(
    BaseModel
):

    username: str = Field(
        min_length=1,
        max_length=100,
    )

    password: str = Field(
        min_length=1,
        max_length=256,
    )


class TokenResponse(
    BaseModel
):

    access_token: str

    token_type: str

    username: str

    role: str


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    body: LoginRequest,
):

    user = authenticate_user(
        body.username,
        body.password,
    )


    if not user:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid username or password.",
        )


    token = create_access_token(
        user
    )


    return {
        "access_token":
            token,

        "token_type":
            "bearer",

        "username":
            user["username"],

        "role":
            user["role"],
    }


@router.get(
    "/me"
)
def me(
    user: dict = Depends(
        get_current_user
    ),
):

    return user
