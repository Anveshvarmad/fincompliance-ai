import chromadb

from app.settings import settings


def get_chroma_client():

    return chromadb.HttpClient(
        host=settings.chroma_host,
        port=settings.chroma_port,
    )


def get_policy_collection():

    client = get_chroma_client()

    return client.get_or_create_collection(
        name=settings.chroma_collection,
        metadata={
            "description":
                "Synthetic compliance policy knowledge base"
        },
    )
