import argparse
import json
from pathlib import Path

from app.clients.chroma_client import (
    get_chroma_client,
    get_policy_collection,
)

from app.clients.ollama_embedding_client import (
    embed_texts,
)

from app.knowledge.chunker import (
    chunk_text,
)

from app.settings import settings


DATA_FILE = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    / "data"
    / "compliance_policies.json"
)


def load_policies():
    with DATA_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def reset_collection():
    client = get_chroma_client()

    try:
        client.delete_collection(
            name=settings.chroma_collection
        )

        print(
            "Deleted existing collection."
        )

    except Exception:
        print(
            "No existing collection to delete."
        )


def seed_policies(
    reset: bool = False,
):

    if reset:
        reset_collection()

    collection = (
        get_policy_collection()
    )

    policies = load_policies()

    ids = []
    documents = []
    metadatas = []


    for policy in policies:

        chunks = chunk_text(
            policy["text"]
        )

        for chunk in chunks:

            chunk_id = (
                f'{policy["policy_id"]}'
                f'-CHUNK-{chunk.index:03d}'
            )

            searchable_text = (
                f'Title: {policy["title"]}\n'
                f'Category: {policy["category"]}\n'
                f'Policy: {chunk.text}'
            )

            ids.append(
                chunk_id
            )

            documents.append(
                searchable_text
            )

            metadatas.append({
                "policy_id":
                    policy["policy_id"],

                "title":
                    policy["title"],

                "category":
                    policy["category"],

                "chunk_index":
                    chunk.index,

                "embedding_model":
                    settings.ollama_embedding_model,
            })


    print(
        f"Prepared {len(documents)} chunks "
        f"from {len(policies)} policies."
    )


    print(
        "Generating embeddings with "
        f"{settings.ollama_embedding_model}..."
    )


    embeddings = embed_texts(
        documents
    )


    print(
        f"Generated {len(embeddings)} embeddings."
    )


    print(
        "Embedding dimension:",
        len(embeddings[0]),
    )


    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )


    print(
        "Policy knowledge base seeded."
    )

    print(
        "Collection:",
        settings.chroma_collection,
    )

    print(
        "Record count:",
        collection.count(),
    )


if __name__ == "__main__":

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--reset",
        action="store_true",
    )

    args = parser.parse_args()

    seed_policies(
        reset=args.reset
    )
