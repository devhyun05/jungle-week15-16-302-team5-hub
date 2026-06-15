from fastapi import HTTPException, status
from redis import Redis
from redis.exceptions import RedisError

from app.core.redis import redis_client


def check_rate_limit(
    *,
    key: str,
    limit: int,
    window_seconds: int,
    client: Redis = redis_client,
) -> None:
    count = 0
    ttl = window_seconds

    try:
        count = client.incr(key)

        if count == 1:
            client.expire(key, window_seconds)

        if count > limit:
            ttl = client.ttl(key)
            if ttl < 0:
                client.expire(key, window_seconds)
                ttl = window_seconds

    except RedisError:
        return

    if count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(max(ttl, 1))},
        )
