import uuid

import httpx


def test_health_is_public(
    base_url,
):

    response = httpx.get(
        f"{base_url}/health",
        timeout=10.0,
    )

    assert response.status_code == 200

    data = response.json()

    assert (
        data.get("status")
        in {
            "running",
            "up",
            "healthy",
        }
        or "services" in data
    )


def test_authenticated_identity(
    base_url,
    analyst_headers,
):

    response = httpx.get(
        f"{base_url}/api/v1/auth/me",
        headers=
            analyst_headers,
        timeout=10.0,
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "role"
    ] == "analyst"


def test_viewer_can_read_transactions(
    base_url,
    viewer_headers,
):

    response = httpx.get(
        (
            f"{base_url}"
            "/api/v1/transactions"
            "?limit=5"
        ),
        headers=
            viewer_headers,
        timeout=20.0,
    )

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "total" in data


def test_invalid_token_rejected(
    base_url,
):

    response = httpx.get(
        (
            f"{base_url}"
            "/api/v1/transactions"
            "?limit=1"
        ),
        headers={
            "Authorization":
                "Bearer invalid-token"
        },
        timeout=10.0,
    )

    assert response.status_code == 401


def test_viewer_cannot_analyze_transaction(
    base_url,
    viewer_headers,
    sample_transaction_ref,
):

    response = httpx.post(
        (
            f"{base_url}"
            "/api/v1/compliance/"
            "transactions/"
            f"{sample_transaction_ref}"
            "/analyze"
        ),
        headers=
            viewer_headers,
        timeout=20.0,
    )

    assert response.status_code == 403


def test_analyst_can_analyze_transaction(
    base_url,
    analyst_headers,
    sample_transaction_ref,
):

    response = httpx.post(
        (
            f"{base_url}"
            "/api/v1/compliance/"
            "transactions/"
            f"{sample_transaction_ref}"
            "/analyze"
        ),
        headers=
            analyst_headers,
        timeout=30.0,
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(
        data["risk_score"],
        int,
    )

    assert (
        0
        <= data["risk_score"]
        <= 100
    )

    assert data[
        "risk_level"
    ] in {
        "low",
        "medium",
        "high",
        "critical",
    }


def test_assessment_is_idempotent(
    base_url,
    analyst_headers,
    sample_transaction_ref,
):

    first = httpx.post(
        (
            f"{base_url}"
            "/api/v1/compliance/"
            "transactions/"
            f"{sample_transaction_ref}"
            "/analyze"
        ),
        headers=
            analyst_headers,
        timeout=30.0,
    )

    second = httpx.post(
        (
            f"{base_url}"
            "/api/v1/compliance/"
            "transactions/"
            f"{sample_transaction_ref}"
            "/analyze"
        ),
        headers=
            analyst_headers,
        timeout=30.0,
    )

    assert first.status_code == 200
    assert second.status_code == 200

    first_data = first.json()
    second_data = second.json()

    assert (
        first_data["id"]
        == second_data["id"]
    )

    assert (
        first_data["risk_score"]
        == second_data["risk_score"]
    )


def test_dashboard_contract(
    base_url,
    viewer_headers,
):

    response = httpx.get(
        (
            f"{base_url}"
            "/api/v1/dashboard/"
            "overview"
        ),
        headers=
            viewer_headers,
        timeout=30.0,
    )

    assert response.status_code == 200

    data = response.json()

    assert "metrics" in data
    assert "risk_distribution" in data
    assert "risk_activity" in data
    assert "recent_transactions" in data

    metrics = data[
        "metrics"
    ]

    assert (
        metrics[
            "transactions_total"
        ]
        >= 0
    )


def test_semantic_knowledge_search(
    base_url,
    viewer_headers,
):

    response = httpx.get(
        (
            f"{base_url}"
            "/api/v1/knowledge/search"
        ),
        params={
            "q":
                "large international "
                "wire transfer",

            "limit":
                3,
        },
        headers=
            viewer_headers,
        timeout=90.0,
    )

    assert response.status_code == 200, (
        response.text
    )

    data = response.json()

    assert "items" in data

    assert len(
        data["items"]
    ) > 0

    first = data[
        "items"
    ][0]

    assert "policy_id" in first
    assert "title" in first
    assert "distance" in first


def test_request_id_round_trip(
    base_url,
):

    request_id = (
        "phase10-"
        + str(
            uuid.uuid4()
        )
    )

    response = httpx.get(
        f"{base_url}/health",
        headers={
            "X-Request-ID":
                request_id
        },
        timeout=10.0,
    )

    assert response.status_code == 200

    assert (
        response.headers.get(
            "x-request-id"
        )
        == request_id
    )


def test_security_headers(
    base_url,
):

    response = httpx.get(
        f"{base_url}/health",
        timeout=10.0,
    )

    assert (
        response.headers.get(
            "x-content-type-options"
        )
        == "nosniff"
    )

    assert (
        response.headers.get(
            "x-frame-options"
        )
        == "DENY"
    )

    assert (
        response.headers.get(
            "referrer-policy"
        )
        == "no-referrer"
    )


def test_standardized_not_found_error(
    base_url,
    viewer_headers,
):

    response = httpx.get(
        (
            f"{base_url}"
            "/api/v1/transactions/"
            "TXN-NOT-A-REAL-TRANSACTION"
        ),
        headers=
            viewer_headers,
        timeout=10.0,
    )

    assert response.status_code == 404

    data = response.json()

    assert "detail" in data
    assert "request_id" in data
