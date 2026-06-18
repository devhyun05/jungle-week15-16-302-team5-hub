from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import require_roles
from app.schemas.ai import AIGenerateRequest, AIGenerateResponse
from app.services import ai_service


router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate", response_model=AIGenerateResponse)
def generate_ai_content(
    request: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> AIGenerateResponse:
    """
    포트폴리오 프로젝트 자료를 기준으로 OpenAI 생성 결과를 반환한다.
    """

    try:
        result = ai_service.generate_project_content(
            db=db,
            project_id=request.project_id,
            output_type=request.output_type,
            generation_mode=request.generation_mode,
            current_user=current_user,
        )
    except ai_service.AIConfigurationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ai_service.AIGenerationError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    if result is None:
        raise HTTPException(status_code=404, detail="포트폴리오 프로젝트를 찾을 수 없습니다.")

    return result
