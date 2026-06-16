from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import require_roles
from app.schemas.rag import RagIndexRequest, RagIndexResponse, RagSearchItem, RagSearchRequest, RagSearchResponse
from app.services import rag_service


router = APIRouter(prefix="/ai/rag", tags=["ai-rag"])


@router.post("/index", response_model=RagIndexResponse)
def index_rag_documents(
    request: RagIndexRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> RagIndexResponse:
    try:
        project, indexed_count = rag_service.index_project_documents(
            db=db,
            project_id=request.project_id,
            current_user=current_user,
        )
    except rag_service.RagIndexError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    if project is None:
        raise HTTPException(status_code=404, detail="Portfolio project not found.")

    return RagIndexResponse(
        project_id=project.id,
        indexed_count=indexed_count,
        embedding_model=settings.openai_embedding_model,
    )


@router.post("/search", response_model=RagSearchResponse)
def search_rag_documents(
    request: RagSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> RagSearchResponse:
    try:
        project, results = rag_service.search_project_documents(
            db=db,
            project_id=request.project_id,
            query=request.query,
            current_user=current_user,
            top_k=request.top_k,
        )
    except rag_service.RagIndexError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    if project is None:
        raise HTTPException(status_code=404, detail="Portfolio project not found.")

    return RagSearchResponse(
        project_id=project.id,
        query=request.query,
        items=[
            RagSearchItem(
                document_id=result.document_id,
                source_type=result.source_type,
                source_id=result.source_id,
                title=result.title,
                content=result.content,
                score=result.score,
            )
            for result in results
        ],
    )
