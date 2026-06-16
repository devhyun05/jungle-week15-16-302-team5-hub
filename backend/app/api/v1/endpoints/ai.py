from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import get_user_by_id
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
    if post.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a trade alert to yourself.",
        )

    seller = get_user_by_id(db, user_id=post.seller_id)
    if seller is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found.",
        )

    return slack_mcp_service.send_slack_trade_alert(
        post=post,
        sender=current_user,
        seller=seller,
        message=request.message,
    )
