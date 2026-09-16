from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import httpx
import psycopg
from pymongo import MongoClient

from app.settings import settings
from app.api.customers import router as customers_router
from app.api.transactions import router as transactions_router
from app.api.compliance import router as compliance_router



app = FastAPI(
    title="FinCompliance AI API",
    version="0.1.0"
)


app.include_router(customers_router)
app.include_router(transactions_router)
app.include_router(compliance_router)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "application": "FinCompliance AI",
        "phase": 1,
        "message": "Backend is running"
    }


def check_postgres():
    try:
        connection_string = (
            f"postgresql://{settings.postgres_user}:"
            f"{settings.postgres_password}@"
            f"{settings.postgres_host}:"
            f"{settings.postgres_port}/"
            f"{settings.postgres_db}"
        )

        with psycopg.connect(
            connection_string,
            connect_timeout=3
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

        return "up"

    except Exception as exc:
        return f"down: {str(exc)}"


def check_mongo():
    try:
        client = MongoClient(
            settings.mongo_url,
            serverSelectionTimeoutMS=3000
        )

        client.admin.command("ping")
        client.close()

        return "up"

    except Exception as exc:
        return f"down: {str(exc)}"


async def check_http_service(url):
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(url)

        if response.status_code < 500:
            return "up"

        return f"down: status {response.status_code}"

    except Exception as exc:
        return f"down: {str(exc)}"


@app.get("/health")
async def health():
    postgres_status = check_postgres()
    mongo_status = check_mongo()

    chroma_status = await check_http_service(
        f"http://{settings.chroma_host}:"
        f"{settings.chroma_port}/api/v2/heartbeat"
    )

    event_status = await check_http_service(
        f"{settings.event_service_url}/health"
    )

    ollama_status = await check_http_service(
        f"{settings.ollama_base_url}/api/tags"
    )

    return {
        "status": "running",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "up",
            "postgres": postgres_status,
            "mongo": mongo_status,
            "chroma": chroma_status,
            "event_service": event_status,
            "ollama": ollama_status
        }
    }
