from hashlib import sha256
from math import sqrt
import re

import httpx

from app.core.config import get_settings


class EmbeddingServiceError(RuntimeError):
    pass


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def content_hash(text: str) -> str:
    settings = get_settings()
    hash_input = f"{settings.openai_embedding_model}:{normalize_text(text)}"
    return sha256(hash_input.encode("utf-8")).hexdigest()


def create_embedding(text: str) -> list[float]:
    settings = get_settings()
    input_text = normalize_text(text)

    if not input_text:
        raise EmbeddingServiceError("Embedding input text is empty.")

    if not settings.openai_api_key:
        raise EmbeddingServiceError("OPENAI_API_KEY is not configured.")

    try:
        response = httpx.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            json={
                "model": settings.openai_embedding_model,
                "input": input_text,
            },
            timeout=20,
        )
        response.raise_for_status()
    except httpx.HTTPError as error:
        raise EmbeddingServiceError("Failed to create OpenAI embedding.") from error

    try:
        data = response.json()
        return data["data"][0]["embedding"]
    except (ValueError, KeyError, IndexError, TypeError) as error:
        raise EmbeddingServiceError("Invalid OpenAI embedding response.") from error


def has_current_embedding(
    *,
    stored_hash: str,
    stored_vector: list[float],
    current_hash: str,
    expected_dimension: int | None,
) -> bool:
    if stored_hash != current_hash:
        return False

    if expected_dimension is None:
        return True

    return len(stored_vector) == expected_dimension


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0

    left_length = sqrt(sum(value * value for value in left))
    right_length = sqrt(sum(value * value for value in right))
    if left_length == 0 or right_length == 0:
        return 0.0

    dot_product = sum(
        left_value * right_value
        for left_value, right_value in zip(left, right)
    )
    return dot_product / (left_length * right_length)
