from sqlalchemy.orm import Session

from app.models.post import Post
from app.repositories import ai_repository
from app.schemas.ai import RagSource
from app.services.embedding_service import (
    content_hash,
    cosine_similarity,
    create_fake_embedding,
)


def build_post_source_text(post: Post) -> str:
    return " ".join(
        value
        for value in [
            post.title,
            post.description or "",
            post.category,
            post.trade_location,
        ]
        if value
    )


def index_recent_posts(db: Session) -> None:
    posts = ai_repository.list_posts_for_rag(db)
    for post in posts:
        source_text = build_post_source_text(post)
        source_hash = content_hash(source_text)
        embedding = ai_repository.get_post_writing_embedding(db, post_id=post.id)

        if embedding is not None and embedding.content_hash == source_hash:
            continue

        ai_repository.save_post_writing_embedding(
            db,
            post=post,
            source_text=source_text,
            content_hash=source_hash,
            vector=create_fake_embedding(source_text),
        )


def search_similar_posts(
    db: Session,
    *,
    query_text: str,
    limit: int = 3,
) -> list[RagSource]:
    index_recent_posts(db)
    query_vector = create_fake_embedding(query_text)
    scored_sources: list[RagSource] = []

    for embedding, post in ai_repository.list_post_writing_embeddings(db):
        score = cosine_similarity(query_vector, embedding.vector)
        if score <= 0:
            continue

        scored_sources.append(
            RagSource(
                post_id=post.id,
                title=post.title,
                category=post.category,
                score=round(score, 3),
            )
        )

    return sorted(scored_sources, key=lambda source: source.score, reverse=True)[:limit]
