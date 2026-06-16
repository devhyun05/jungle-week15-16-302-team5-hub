from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import RagDocument


def delete_project_documents(db: Session, project_id: int) -> None:
    db.execute(delete(RagDocument).where(RagDocument.project_id == project_id))


def create_documents(db: Session, documents: list[RagDocument]) -> list[RagDocument]:
    db.add_all(documents)
    db.flush()

    return documents


def get_project_documents(db: Session, project_id: int) -> list[RagDocument]:
    return list(
        db.scalars(
            select(RagDocument)
            .where(RagDocument.project_id == project_id)
            .order_by(RagDocument.source_type.asc(), RagDocument.id.asc()),
        ).all(),
    )
