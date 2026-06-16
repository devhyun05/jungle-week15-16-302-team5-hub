from hashlib import sha256
from math import sqrt
import re


VECTOR_SIZE = 64


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def content_hash(text: str) -> str:
    return sha256(normalize_text(text).encode("utf-8")).hexdigest()


def create_fake_embedding(text: str) -> list[float]:
    vector = [0.0 for _ in range(VECTOR_SIZE)]
    words = re.findall(r"[0-9a-zA-Z가-힣]+", normalize_text(text))

    for word in words:
        index = int(sha256(word.encode("utf-8")).hexdigest(), 16) % VECTOR_SIZE
        vector[index] += 1.0

    length = sqrt(sum(value * value for value in vector))
    if length == 0:
        return vector

    return [value / length for value in vector]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right:
        return 0.0

    return sum(left_value * right_value for left_value, right_value in zip(left, right))
