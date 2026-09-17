import json
import re
from pathlib import Path

from sqlalchemy import text

from app.db import engine


REPORT_DIR = Path(
    "/app/reports"
)

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def explain(
    connection,
    sql,
    params=None,
):

    statement = text(
        (
            "EXPLAIN "
            "(ANALYZE, BUFFERS, FORMAT TEXT) "
            + sql
        )
    )


    rows = connection.execute(
        statement,
        params or {},
    ).fetchall()


    lines = [
        row[0]
        for row in rows
    ]


    plan = "\n".join(
        lines
    )


    planning_match = re.search(
        r"Planning Time: ([0-9.]+) ms",
        plan,
    )


    execution_match = re.search(
        r"Execution Time: ([0-9.]+) ms",
        plan,
    )


    return {
        "plan":
            plan,

        "planning_ms":
            (
                float(
                    planning_match.group(1)
                )
                if planning_match
                else None
            ),

        "execution_ms":
            (
                float(
                    execution_match.group(1)
                )
                if execution_match
                else None
            ),
    }


with engine.connect() as connection:

    sample_ref = connection.execute(
        text(
            """
            SELECT transaction_ref
            FROM transactions
            ORDER BY occurred_at DESC
            LIMIT 1
            """
        )
    ).scalar_one()


    sample_type = connection.execute(
        text(
            """
            SELECT transaction_type
            FROM transactions
            LIMIT 1
            """
        )
    ).scalar_one()


    queries = [
        {
            "name":
                "Recent transactions",

            "sql":
                """
                SELECT
                    transaction_ref,
                    amount,
                    currency,
                    occurred_at
                FROM transactions
                ORDER BY occurred_at DESC
                LIMIT 20
                """,

            "params":
                {},
        },

        {
            "name":
                "Transaction type filter",

            "sql":
                """
                SELECT
                    transaction_ref,
                    amount,
                    transaction_type,
                    occurred_at
                FROM transactions
                WHERE transaction_type = :transaction_type
                ORDER BY occurred_at DESC
                LIMIT 20
                """,

            "params": {
                "transaction_type":
                    sample_type,
            },
        },

        {
            "name":
                "Risk assessment by transaction reference",

            "sql":
                """
                SELECT
                    ra.risk_score,
                    ra.risk_level,
                    ra.analyzed_at
                FROM risk_assessments ra
                JOIN transactions t
                    ON t.id = ra.transaction_id
                WHERE t.transaction_ref = :transaction_ref
                """,

            "params": {
                "transaction_ref":
                    sample_ref,
            },
        },
    ]


    results = []


    for query in queries:

        result = explain(
            connection,
            query[
                "sql"
            ],
            query[
                "params"
            ],
        )

        results.append({
            "name":
                query["name"],

            **result,
        })


    index_rows = connection.execute(
        text(
            """
            SELECT
                tablename,
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename IN (
                    'transactions',
                    'risk_assessments',
                    'rule_matches',
                    'customers',
                    'ai_explanations'
              )
            ORDER BY
                tablename,
                indexname
            """
        )
    ).mappings().all()


indexes = [
    dict(
        row
    )
    for row in index_rows
]


report = {
    "queries":
        results,

    "indexes":
        indexes,
}


(
    REPORT_DIR
    / "phase10_database_performance.json"
).write_text(
    json.dumps(
        report,
        indent=2,
    )
)


markdown = [
    "# Phase 10 PostgreSQL Query Analysis",
    "",
    (
        "Generated using PostgreSQL "
        "`EXPLAIN (ANALYZE, BUFFERS)`."
    ),
    "",
    "## Query timings",
    "",
    "| Query | Planning | Execution |",
    "|---|---:|---:|",
]


for result in results:

    markdown.append(
        (
            f"| {result['name']} "
            f"| {result['planning_ms']} ms "
            f"| {result['execution_ms']} ms |"
        )
    )


markdown.extend([
    "",
    "## Query plans",
    "",
])


for result in results:

    markdown.extend([
        f"### {result['name']}",
        "",
        "```text",
        result["plan"],
        "```",
        "",
    ])


markdown.extend([
    "## Current indexes",
    "",
])


for index in indexes:

    markdown.extend([
        (
            f"### {index['tablename']} "
            f"— {index['indexname']}"
        ),
        "",
        "```sql",
        index["indexdef"],
        "```",
        "",
    ])


markdown.extend([
    "## Notes",
    "",
    (
        "- Query plans are environment- and "
        "dataset-dependent."
    ),
    (
        "- A sequential scan is not automatically "
        "bad on a small table; PostgreSQL may "
        "correctly decide it is cheaper than using "
        "an index."
    ),
    (
        "- Index decisions should be based on "
        "production-like data volume and actual "
        "query patterns."
    ),
])


(
    REPORT_DIR
    / "phase10_database_performance.md"
).write_text(
    "\n".join(
        markdown
    )
    + "\n"
)


print()
print(
    "POSTGRESQL QUERY RESULTS"
)

print(
    "=" * 72
)


for result in results:

    print(
        f"{result['name']:<45} "
        f"execution="
        f"{result['execution_ms']} ms"
    )


print()
print(
    f"Indexes discovered: "
    f"{len(indexes)}"
)

print()
print(
    "Report: "
    "/app/reports/"
    "phase10_database_performance.md"
)
