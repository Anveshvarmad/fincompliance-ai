from dataclasses import dataclass


@dataclass(frozen=True)
class TextChunk:
    index: int
    text: str


def chunk_text(
    text: str,
    max_words: int = 70,
    overlap_words: int = 15,
) -> list[TextChunk]:

    words = text.split()

    if not words:
        return []

    if overlap_words >= max_words:
        raise ValueError(
            "overlap_words must be smaller than max_words"
        )

    chunks = []

    start = 0
    chunk_index = 0

    while start < len(words):

        end = min(
            start + max_words,
            len(words),
        )

        chunk_words = words[
            start:end
        ]

        chunks.append(
            TextChunk(
                index=chunk_index,
                text=" ".join(
                    chunk_words
                ),
            )
        )

        if end == len(words):
            break

        start = (
            end - overlap_words
        )

        chunk_index += 1

    return chunks
