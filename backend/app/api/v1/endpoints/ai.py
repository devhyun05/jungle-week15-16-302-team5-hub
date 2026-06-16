from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai import (
    PostWritingAssistRequest,
    PostWritingAssistResponse,
    SlackTradeAlertRequest,
    SlackTradeAlertResponse,
)
from app.services import ai_agent_service, post_service, slack_mcp_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/post-writing-assist", response_model=PostWritingAssistResponse)
def assist_post_writing(
    request: PostWritingAssistRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostWritingAssistResponse:
    return ai_agent_service.run_post_writing_agent(db, request)


@router.post("/posts/{post_id}/slack-alert", response_model=SlackTradeAlertResponse)
def send_post_slack_alert(
    post_id: int,
    request: SlackTradeAlertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SlackTradeAlertResponse:
    post = post_service.find_post_or_404(db, post_id=post_id)
    post_service.check_post_owner(post, current_user)
    return slack_mcp_service.send_slack_trade_alert(post, message=request.message)
