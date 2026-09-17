import json
import math
import os
import statistics
import time
from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed,
)
from pathlib import Path

import httpx


BASE_URL = os.getenv(
    "TEST_BASE_URL",
    "http://backend:8000",
)

USERNAME = os.environ[
    "TEST_ANALYST_USERNAME"
]

PASSWORD = os.environ[
    "TEST_ANALYST_PASSWORD"
]

REPORT_DIR = Path(
    "/app/reports"
)

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def percentile(
    values,
    percentile_value,
):

    if not values:
        return 0.0

    ordered = sorted(
        values
    )

    position = (
        len(ordered) - 1
    ) * percentile_value

    lower = math.floor(
        position
    )

    upper = math.ceil(
        position
    )

    if lower == upper:
        return ordered[
            lower
        ]

    weight = (
        position
        - lower
    )

    return (
        ordered[lower]
        * (1 - weight)
        +
        ordered[upper]
        * weight
    )


def login():

    response = httpx.post(
        (
            f"{BASE_URL}"
            "/api/v1/auth/login"
        ),
        json={
            "username":
                USERNAME,

            "password":
                PASSWORD,
        },
        timeout=20.0,
    )

    response.raise_for_status()

    return response.json()[
        "access_token"
    ]


TOKEN = login()

AUTH_HEADERS = {
    "Authorization":
        f"Bearer {TOKEN}"
}


def call_endpoint(
    method,
    path,
    *,
    headers=None,
    timeout=30.0,
):

    start = time.perf_counter()

    try:

        response = httpx.request(
            method,
            f"{BASE_URL}{path}",
            headers=headers,
            timeout=timeout,
        )

        elapsed = (
            time.perf_counter()
            - start
        ) * 1000

        return {
            "latency_ms":
                elapsed,

            "status":
                response.status_code,

            "success":
                response.status_code
                < 400,
        }

    except Exception as exc:

        elapsed = (
            time.perf_counter()
            - start
        ) * 1000

        return {
            "latency_ms":
                elapsed,

            "status":
                None,

            "success":
                False,

            "error":
                str(exc),
        }


def benchmark(
    name,
    method,
    path,
    *,
    requests_count,
    concurrency,
    headers=None,
    timeout=30.0,
):

    started = time.perf_counter()

    results = []


    with ThreadPoolExecutor(
        max_workers=
            concurrency
    ) as executor:

        futures = [
            executor.submit(
                call_endpoint,
                method,
                path,
                headers=headers,
                timeout=timeout,
            )
            for _ in range(
                requests_count
            )
        ]


        for future in as_completed(
            futures
        ):

            results.append(
                future.result()
            )


    wall_seconds = (
        time.perf_counter()
        - started
    )


    latencies = [
        item[
            "latency_ms"
        ]
        for item in results
    ]


    successes = sum(
        1
        for item in results
        if item[
            "success"
        ]
    )


    return {
        "name":
            name,

        "path":
            path,

        "requests":
            requests_count,

        "concurrency":
            concurrency,

        "successful":
            successes,

        "failed":
            requests_count
            - successes,

        "error_rate_pct":
            round(
                (
                    (
                        requests_count
                        - successes
                    )
                    / requests_count
                )
                * 100,
                2,
            ),

        "throughput_rps":
            round(
                requests_count
                / wall_seconds,
                2,
            ),

        "mean_ms":
            round(
                statistics.mean(
                    latencies
                ),
                2,
            ),

        "p50_ms":
            round(
                percentile(
                    latencies,
                    .50,
                ),
                2,
            ),

        "p95_ms":
            round(
                percentile(
                    latencies,
                    .95,
                ),
                2,
            ),

        "p99_ms":
            round(
                percentile(
                    latencies,
                    .99,
                ),
                2,
            ),

        "max_ms":
            round(
                max(
                    latencies
                ),
                2,
            ),
    }


# ------------------------------------------------------------
# Ensure at least one assessment exists
# ------------------------------------------------------------

transaction_response = httpx.get(
    (
        f"{BASE_URL}"
        "/api/v1/transactions"
        "?limit=1"
    ),
    headers=
        AUTH_HEADERS,
    timeout=20.0,
)

transaction_response.raise_for_status()

transaction_ref = (
    transaction_response
    .json()["items"][0][
        "transaction_ref"
    ]
)

httpx.post(
    (
        f"{BASE_URL}"
        "/api/v1/compliance/"
        "transactions/"
        f"{transaction_ref}"
        "/analyze"
    ),
    headers=
        AUTH_HEADERS,
    timeout=30.0,
)


benchmarks = []


benchmarks.append(
    benchmark(
        "Public health",
        "GET",
        "/health",
        requests_count=60,
        concurrency=8,
        timeout=10.0,
    )
)


benchmarks.append(
    benchmark(
        "Transaction listing",
        "GET",
        (
            "/api/v1/transactions"
            "?limit=20"
        ),
        requests_count=60,
        concurrency=8,
        headers=AUTH_HEADERS,
        timeout=20.0,
    )
)


benchmarks.append(
    benchmark(
        "Dashboard overview",
        "GET",
        (
            "/api/v1/dashboard/"
            "overview"
        ),
        requests_count=40,
        concurrency=6,
        headers=AUTH_HEADERS,
        timeout=30.0,
    )
)


benchmarks.append(
    benchmark(
        "Risk assessment lookup",
        "GET",
        (
            "/api/v1/compliance/"
            "transactions/"
            f"{transaction_ref}"
            "/assessment"
        ),
        requests_count=40,
        concurrency=6,
        headers=AUTH_HEADERS,
        timeout=20.0,
    )
)


# Semantic retrieval is intentionally run at
# lower concurrency because it includes embedding
# generation and vector search.
benchmarks.append(
    benchmark(
        "Semantic policy search",
        "GET",
        (
            "/api/v1/knowledge/search"
            "?q=large%20international%20"
            "wire%20transfer"
            "&limit=5"
        ),
        requests_count=6,
        concurrency=2,
        headers=AUTH_HEADERS,
        timeout=90.0,
    )
)


report = {
    "base_url":
        BASE_URL,

    "sample_transaction":
        transaction_ref,

    "benchmarks":
        benchmarks,
}


json_path = (
    REPORT_DIR
    / "phase10_api_performance.json"
)

json_path.write_text(
    json.dumps(
        report,
        indent=2,
    )
)


markdown = [
    "# Phase 10 API Performance Report",
    "",
    (
        "Measured against the local "
        "Docker development environment."
    ),
    "",
    "| Endpoint | Requests | Concurrency | p50 | p95 | p99 | Throughput | Error Rate |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
]


for result in benchmarks:

    markdown.append(
        (
            f"| {result['name']} "
            f"| {result['requests']} "
            f"| {result['concurrency']} "
            f"| {result['p50_ms']} ms "
            f"| {result['p95_ms']} ms "
            f"| {result['p99_ms']} ms "
            f"| {result['throughput_rps']} req/s "
            f"| {result['error_rate_pct']}% |"
        )
    )


markdown.extend([
    "",
    "## Interpretation",
    "",
    (
        "- These values describe this local machine "
        "and Docker environment; they are not "
        "production capacity claims."
    ),
    (
        "- Semantic policy search is expected to be "
        "slower than relational reads because it "
        "includes embedding generation and ChromaDB "
        "vector retrieval."
    ),
    (
        "- Performance should be compared across "
        "versions under the same environment rather "
        "than treated as an absolute benchmark."
    ),
])


markdown_path = (
    REPORT_DIR
    / "phase10_api_performance.md"
)

markdown_path.write_text(
    "\n".join(
        markdown
    )
    + "\n"
)


print()
print(
    "API PERFORMANCE RESULTS"
)

print(
    "=" * 78
)


for result in benchmarks:

    print(
        f"{result['name']:<28} "
        f"p50={result['p50_ms']:>8} ms  "
        f"p95={result['p95_ms']:>8} ms  "
        f"p99={result['p99_ms']:>8} ms  "
        f"RPS={result['throughput_rps']:>7}  "
        f"errors={result['error_rate_pct']}%"
    )


print()
print(
    f"Report: {markdown_path}"
)
