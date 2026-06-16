import pytest
from fastapi import HTTPException

from app.services.rate_limit_service import check_rate_limit


class FakeRedis:
    def __init__(self, *, count: int, ttl: int = 30):
        self.count = count
        self.ttl_value = ttl
        self.expire_calls: list[tuple[str, int]] = []
        self.ttl_calls = 0

    def incr(self, key: str) -> int:
        self.key = key
        return self.count

    def expire(self, key: str, window_seconds: int) -> None:
        self.expire_calls.append((key, window_seconds))

    def ttl(self, key: str) -> int:
        self.ttl_calls += 1
        return self.ttl_value


def test_rate_limit_does_not_read_ttl_for_allowed_request():
    client = FakeRedis(count=1)

    check_rate_limit(
        key="rate:comments:create:1",
        limit=5,
        window_seconds=60,
        client=client,
    )

    assert client.expire_calls == [("rate:comments:create:1", 60)]
    assert client.ttl_calls == 0


def test_rate_limit_reads_ttl_only_when_limit_is_exceeded():
    client = FakeRedis(count=6, ttl=42)

    with pytest.raises(HTTPException) as exc_info:
        check_rate_limit(
            key="rate:comments:create:1",
            limit=5,
            window_seconds=60,
            client=client,
        )

    assert client.ttl_calls == 1
    assert exc_info.value.status_code == 429
    assert exc_info.value.headers == {"Retry-After": "42"}


def test_rate_limit_restores_expiry_when_exceeded_key_has_no_ttl():
    client = FakeRedis(count=6, ttl=-1)

    with pytest.raises(HTTPException) as exc_info:
        check_rate_limit(
            key="rate:comments:create:1",
            limit=5,
            window_seconds=60,
            client=client,
        )

    assert client.ttl_calls == 1
    assert client.expire_calls == [("rate:comments:create:1", 60)]
    assert exc_info.value.headers == {"Retry-After": "60"}
