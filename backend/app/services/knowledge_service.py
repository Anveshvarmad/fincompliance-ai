from app.clients.chroma_client import (
    get_policy_collection,
)

from app.clients.ollama_embedding_client import (
    embed_texts,
)


class KnowledgeService:

    @staticmethod
    def search(
        query: str,
        limit: int = 5,
        category: str | None = None,
    ) -> list[dict]:

        query = query.strip()

        if not query:
            return []

        query_embedding = embed_texts(
            [query]
        )[0]


        collection = (
            get_policy_collection()
        )


        query_args = {
            "query_embeddings": [
                query_embedding
            ],

            "n_results":
                limit,

            "include": [
                "documents",
                "metadatas",
                "distances",
            ],
        }


        if category:

            query_args["where"] = {
                "category":
                    category
            }


        result = collection.query(
            **query_args
        )


        ids = (
            result.get("ids", [[]])[0]
        )

        documents = (
            result.get(
                "documents",
                [[]]
            )[0]
        )

        metadatas = (
            result.get(
                "metadatas",
                [[]]
            )[0]
        )

        distances = (
            result.get(
                "distances",
                [[]]
            )[0]
        )


        matches = []


        for rank, (
            item_id,
            document,
            metadata,
            distance,
        ) in enumerate(
            zip(
                ids,
                documents,
                metadatas,
                distances,
            ),
            start=1,
        ):

            matches.append({
                "rank":
                    rank,

                "chunk_id":
                    item_id,

                "policy_id":
                    metadata.get(
                        "policy_id"
                    ),

                "title":
                    metadata.get(
                        "title"
                    ),

                "category":
                    metadata.get(
                        "category"
                    ),

                "chunk_index":
                    metadata.get(
                        "chunk_index"
                    ),

                "distance":
                    float(distance),

                "text":
                    document,
            })


        return matches
