from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai import PostWritingEmbedding, RestrictedTradePolicyEmbedding
from app.models.post import Post


def get_post_writing_embedding(
    db: Session,
    post_id: int,
) -> PostWritingEmbedding | None:
    statement = select(PostWritingEmbedding).where(PostWritingEmbedding.post_id == post_id)
    return db.scalar(statement)


def save_post_writing_embedding(
    db: Session,
    *,
    post: Post,
    source_text: str,
    content_hash: str,
    vector: list[float],
) -> PostWritingEmbedding:
    embedding = get_post_writing_embedding(db, post_id=post.id)

    if embedding is None:
        embedding = PostWritingEmbedding(
            post_id=post.id,
            source_text=source_text,
            content_hash=content_hash,
            vector=vector,
        )
        db.add(embedding)
    else:
        embedding.source_text = source_text
        embedding.content_hash = content_hash
        embedding.vector = vector

    db.commit()
    db.refresh(embedding)
    return embedding


def list_posts_for_rag(db: Session, limit: int = 80) -> list[Post]:
    statement = (
        select(Post)
        .where(Post.deleted_at.is_(None))
        .order_by(Post.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(statement))


def list_post_writing_embeddings(db: Session) -> list[tuple[PostWritingEmbedding, Post]]:
    statement = (
        select(PostWritingEmbedding, Post)
        .join(Post, Post.id == PostWritingEmbedding.post_id)
        .where(Post.deleted_at.is_(None))
    )
    return list(db.execute(statement))


def get_restricted_policy_embedding(
    db: Session,
    policy_id: str,
) -> RestrictedTradePolicyEmbedding | None:
    statement = select(RestrictedTradePolicyEmbedding).where(
        RestrictedTradePolicyEmbedding.policy_id == policy_id
    )
    return db.scalar(statement)


def save_restricted_policy_embedding(
    db: Session,
    *,
    policy: dict,
    content_hash: str,
    vector: list[float],
) -> RestrictedTradePolicyEmbedding:
    embedding = get_restricted_policy_embedding(db, policy_id=policy["policy_id"])

    if embedding is None:
        embedding = RestrictedTradePolicyEmbedding(
            policy_id=policy["policy_id"],
            title=policy["title"],
            category=policy["category"],
            severity=policy["severity"],
            source_url=policy["source_url"],
            source_text=policy["source_text"],
            content_hash=content_hash,
            vector=vector,
        )
        db.add(embedding)
    else:
        embedding.title = policy["title"]
        embedding.category = policy["category"]
        embedding.severity = policy["severity"]
        embedding.source_url = policy["source_url"]
        embedding.source_text = policy["source_text"]
        embedding.content_hash = content_hash
        embedding.vector = vector

    db.commit()
    db.refresh(embedding)
    return embedding


def list_restricted_policy_embeddings(db: Session) -> list[RestrictedTradePolicyEmbedding]:
    statement = select(RestrictedTradePolicyEmbedding)
    return list(db.scalars(statement))
