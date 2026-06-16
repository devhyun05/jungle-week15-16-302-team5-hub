from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import require_roles
from app.schemas.agent import AgentRunRequest, AgentRunResponse
from app.services import agent_service


router = APIRouter(prefix="/ai/agent", tags=["ai-agent"])


@router.post("/run", response_model=AgentRunResponse)
def run_ai_agent(
    request: AgentRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> AgentRunResponse:
    try:
        final_content, tool_calls, stopped_reason = agent_service.run_project_agent(
            db=db,
            project_id=request.project_id,
            output_type=request.output_type,
            user_goal=request.user_goal,
            max_iterations=request.max_iterations,
            current_user=current_user,
        )
    except agent_service.AgentRunError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return AgentRunResponse(
        project_id=request.project_id,
        output_type=request.output_type,
        final_content=final_content,
        tool_calls=tool_calls,
        stopped_reason=stopped_reason,
    )
