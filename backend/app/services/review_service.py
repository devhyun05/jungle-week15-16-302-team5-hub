from sqlalchemy.orm import Session

from app.db.models import ReviewRequest, User
from app.repositories import review_repository
from app.schemas.review import (
    CoachOptionListResponse,
    CoachOptionResponse,
    ReviewRequestCreateRequest,
    ReviewRequestListResponse,
    ReviewRequestResponse,
    ReviewRequestUpdateRequest,
)


ROLE_ADMIN = "ADMIN"
VALID_REVIEW_STATUSES = {"대기 중", "검토 중", "피드백 완료", "수정 요청", "최종 확인"}


def get_coach_options(db: Session) -> CoachOptionListResponse:
    coaches = review_repository.list_approved_coaches(db=db)

    return CoachOptionListResponse(
        items=[
            CoachOptionResponse(
                id=coach.id,
                name=coach.name,
                email=coach.email,
                profile_image_url=coach.profile_image_url,
            )
            for coach in coaches
        ]
    )


def create_review_request(
    db: Session,
    request: ReviewRequestCreateRequest,
    current_user: User,
) -> ReviewRequestResponse:
    """
    학생이 게시글 또는 포트폴리오 프로젝트에 대한 코치 리뷰를 요청한다.
    """

    if request.target_type == "post":
        target_post = review_repository.get_post_target(
            db=db,
            post_id=request.target_id,
            current_user=current_user,
        )

        if target_post is None:
            raise ValueError("리뷰 요청할 게시글을 찾을 수 없습니다.")

        category = target_post.category
        target_post_id = target_post.id
        target_project_id = None
    else:
        target_project = review_repository.get_project_target(
            db=db,
            project_id=request.target_id,
            current_user=current_user,
        )

        if target_project is None:
            raise ValueError("리뷰 요청할 포트폴리오 프로젝트를 찾을 수 없습니다.")

        category = review_repository.get_category_by_slug(db=db, category_slug="portfolio")

        if category is None:
            raise ValueError("포트폴리오 카테고리를 찾을 수 없습니다.")

        target_post_id = None
        target_project_id = target_project.id

    coaches = review_repository.get_approved_coaches_by_ids(
        db=db,
        coach_ids=request.coach_ids,
    )

    if len(coaches) != len(set(request.coach_ids)):
        raise ValueError("승인 완료된 코치만 선택할 수 있습니다.")

    review_request = review_repository.create_review_request(
        db=db,
        requester=current_user,
        category=category,
        target_type=request.target_type,
        target_post_id=target_post_id,
        target_project_id=target_project_id,
        message=request.message.strip() if request.message else "리뷰 부탁드립니다.",
        coaches=coaches,
    )

    return build_review_request_response(review_request)


def get_my_review_requests(db: Session, current_user: User) -> ReviewRequestListResponse:
    requests = review_repository.list_requests_by_requester(
        db=db,
        requester_id=current_user.id,
    )

    return ReviewRequestListResponse(
        items=[build_review_request_response(request) for request in requests],
        total=len(requests),
    )


def get_review_inbox(db: Session, current_user: User) -> ReviewRequestListResponse:
    requests = review_repository.list_requests_for_coach(
        db=db,
        coach=current_user,
    )

    return ReviewRequestListResponse(
        items=[build_review_request_response(request) for request in requests],
        total=len(requests),
    )


def update_review_request(
    db: Session,
    review_request_id: int,
    request: ReviewRequestUpdateRequest,
    current_user: User,
) -> ReviewRequestResponse | None:
    review_request = review_repository.get_review_request_by_id(
        db=db,
        review_request_id=review_request_id,
    )

    if review_request is None:
        return None

    if not review_repository.is_assigned_coach(review_request=review_request, current_user=current_user):
        raise PermissionError("배정된 코치만 리뷰를 수정할 수 있습니다.")

    if request.status is not None and request.status not in VALID_REVIEW_STATUSES:
        raise ValueError("존재하지 않는 리뷰 상태입니다.")

    if request.status in {"수정 요청", "피드백 완료"} and not (request.feedback or "").strip():
        raise ValueError("피드백 내용을 입력해 주세요.")

    feedback = request.feedback.strip() if request.feedback else None

    if request.status == "최종 확인" and not feedback:
        feedback = "이 정도면 만족합니다. 최종 확인 처리했습니다."

    updated_request = review_repository.update_review_request(
        db=db,
        review_request=review_request,
        status=request.status,
        feedback=feedback,
    )

    return build_review_request_response(updated_request)


def cancel_my_review_request(
    db: Session,
    review_request_id: int,
    current_user: User,
) -> bool:
    review_request = review_repository.get_review_request_by_id(
        db=db,
        review_request_id=review_request_id,
    )

    if review_request is None:
        return False

    if review_request.requester_id != current_user.id and current_user.role != ROLE_ADMIN:
        raise PermissionError("본인이 보낸 리뷰 요청만 취소할 수 있습니다.")

    if review_request.status != "대기 중":
        raise ValueError("검토가 시작된 요청은 취소할 수 없습니다.")

    review_repository.delete_pending_request(
        db=db,
        review_request=review_request,
    )

    return True


def build_review_request_response(review_request: ReviewRequest) -> ReviewRequestResponse:
    if review_request.target_type == "post" and review_request.target_post is not None:
        target_id = review_request.target_post.id
        target_title = review_request.target_post.title
        target_summary = review_request.target_post.summary
        target_preview = review_request.target_post.content
        target_link_url = review_request.target_post.related_commit
    elif review_request.target_project is not None:
        target_id = review_request.target_project.id
        target_title = review_request.target_project.title
        target_summary = review_request.target_project.summary
        target_preview = review_request.target_project.saved_portfolio_draft or review_request.target_project.readme_summary
        target_link_url = review_request.target_project.github_url
    else:
        target_id = review_request.target_post_id or review_request.target_project_id or 0
        target_title = "삭제되었거나 찾을 수 없는 대상"
        target_summary = None
        target_preview = None
        target_link_url = None

    coach_links = review_request.review_request_coaches

    return ReviewRequestResponse(
        id=review_request.id,
        requester_id=review_request.requester_id,
        requester_name=review_request.requester.name,
        requester_profile_image_url=review_request.requester.profile_image_url,
        coach_ids=[link.coach_id for link in coach_links],
        coach_names=[link.coach.name for link in coach_links],
        coach_profile_image_urls=[link.coach.profile_image_url for link in coach_links],
        target_type=review_request.target_type,
        target_id=target_id,
        target_title=target_title,
        target_summary=target_summary,
        target_preview=target_preview,
        target_link_url=target_link_url,
        category=review_request.category.label,
        category_slug=review_request.category.slug,
        message=review_request.message,
        status=review_request.status,
        feedback=review_request.feedback,
        created_at=review_request.created_at,
        updated_at=review_request.updated_at,
    )
