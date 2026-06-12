from sqlalchemy.orm import Session

from app.models.tag import Tag


def normalize_tag_name(tag_name: str) -> str:
    return " ".join(tag_name.strip().lower().split())


def resolve_tags(db: Session, tag_names: list[str]) -> list[Tag]:
    tags: list[Tag] = []
    seen: set[str] = set()

    for raw_name in tag_names:
        normalized_name = normalize_tag_name(raw_name)

        if not normalized_name or normalized_name in seen:
            continue

        seen.add(normalized_name)

        tag = (
            db.query(Tag)
            .filter(Tag.normalized_name == normalized_name)
            .first()
        )

        if tag is None:
            tag = Tag(
                normalized_name=normalized_name,
                display_name=raw_name.strip(),
            )
            db.add(tag)

        tags.append(tag)

    return tags


def list_tags(db: Session) -> list[Tag]:
    return (
        db.query(Tag)
        .order_by(Tag.normalized_name.asc())
        .all()
    )
