import os

import httpx
import pytest


BASE_URL = os.getenv(
    "TEST_BASE_URL",
    "http://backend:8000",
)


def login(
    username,
    password,
):

    response = httpx.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={
            "username":
                username,

            "password":
                password,
        },
        timeout=20.0,
    )

    assert (
        response.status_code
        == 200
    ), response.text

    data = response.json()

    return data[
        "access_token"
    ]


@pytest.fixture(
    scope="session"
)
def base_url():

    return BASE_URL


@pytest.fixture(
    scope="session"
)
def viewer_token():

    username = os.environ[
        "TEST_VIEWER_USERNAME"
    ]

    password = os.environ[
        "TEST_VIEWER_PASSWORD"
    ]

    return login(
        username,
        password,
    )


@pytest.fixture(
    scope="session"
)
def analyst_token():

    username = os.environ[
        "TEST_ANALYST_USERNAME"
    ]

    password = os.environ[
        "TEST_ANALYST_PASSWORD"
    ]

    return login(
        username,
        password,
    )


@pytest.fixture
def viewer_headers(
    viewer_token
):

    return {
        "Authorization":
            f"Bearer {viewer_token}"
    }


@pytest.fixture
def analyst_headers(
    analyst_token
):

    return {
        "Authorization":
            f"Bearer {analyst_token}"
    }


@pytest.fixture(
    scope="session"
)
def sample_transaction_ref(
    analyst_token,
):

    response = httpx.get(
        (
            f"{BASE_URL}"
            "/api/v1/transactions"
            "?limit=1"
        ),
        headers={
            "Authorization":
                f"Bearer {analyst_token}"
        },
        timeout=20.0,
    )

    assert (
        response.status_code
        == 200
    ), response.text

    items = response.json().get(
        "items",
        [],
    )

    assert items, (
        "Database contains no "
        "transactions."
    )

    return items[0][
        "transaction_ref"
    ]
