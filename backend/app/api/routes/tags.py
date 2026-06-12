from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tag import TagResponse
from app.services.tag_service import list_tags


router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("/", response_model=list[TagResponse])
def list_tags_endpoint(
    db: Session = Depends(get_db),
):
    return list_tags(db)
