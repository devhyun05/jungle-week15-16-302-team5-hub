from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.db.models import PortfolioProject, Post, PostCategory, ReviewRequest, ReviewRequestCoach, User


ROLE_ADMIN = "ADMIN"
ROLE_COACH = "COACH"
APPROVAL_APPROVED = "승인 완료"


def list_approved_coaches(db: Session) -> list[User]:
    """
    학생이 리뷰 요청을 보낼 수 있는 승인 완료 코치 목록을 조회한다.
    """

    return list(
        db.scalars(
            select(User)
            .where(
                User.role == ROLE_COACH,
                User.approval_status == APPROVAL_APPROVED,
            )
            .order_by(User.name.asc())
        )
    )


def get_post_target(db: Session, post_id: int, current_user: User) -> Post | None:
    """
    리뷰 요청 대상으로 사용할 수 있는 게시글을 조회한다.
    """

    filters = [
        Post.id == post_id,
        Post.deleted_at.is_(None),
    ]

    if current_user.role != ROLE_ADMIN:
        filters.append(Post.author_id == current_user.id)

    return db.scalar(
        select(Post)
        .options(selectinload(Post.category))
        .where(*filters)
    )


def get_project_target(db: Session, project_id: int, current_user: User) -> PortfolioProject | None:
    """
    리뷰 요청 대상으로 사용할 수 있는 포트폴리오 프로젝트를 조회한다.
    """

    filters = [PortfolioProject.id == project_id]

    if current_user.role != ROLE_ADMIN:
        filters.append(PortfolioProject.owner_id == current_user.id)

    return db.scalar(select(PortfolioProject).where(*filters))


def get_category_by_slug(db: Session, category_slug: str) -> PostCategory | None:
    return db.scalar(select(PostCategory).where(PostCategory.slug == category_slug))


def get_approved_coaches_by_ids(db: Session, coach_ids: list[int]) -> list[User]:
    """
    요청받은 coachIds가 실제 승인 완료 코치인지 조회한다.
    """

    unique_coach_ids = list(dict.fromkeys(coach_ids))

    if not unique_coach_ids:
        return []

    return list(
        db.scalars(
            select(User).where(
                User.id.in_(unique_coach_ids),
                User.role == ROLE_COACH,
                User.approval_status == APPROVAL_APPROVED,
            )
        )
    )


def create_review_request(
    db: Session,
    requester: User,
    category: PostCategory,
    target_type: str,
    target_post_id: int | None,
    target_project_id: int | None,
    message: str | None,
    coaches: list[User],
) -> ReviewRequest:
    """
    리뷰 요청과 담당 코치 연결 row를 함께 저장한다.
    """

    review_request = ReviewRequest(
        requester=requester,
        category=category,
        target_type=target_type,
        target_post_id=target_post_id,
        target_project_id=target_project_id,
        message=message,
        status="대기 중",
    )
    db.add(review_request)
    db.flush()

    for coach in coaches:
        db.add(ReviewRequestCoach(review_request_id=review_request.id, coach_id=coach.id))

    db.commit()

    return get_review_request_by_id(db=db, review_request_id=review_request.id) or review_request


def get_review_request_by_id(db: Session, review_request_id: int) -> ReviewRequest | None:
    """
    응답 조립에 필요한 관계를 포함해 리뷰 요청 하나를 조회한다.
    """

    return db.scalar(
        select(ReviewRequest)
        .options(
            selectinload(ReviewRequest.requester),
            selectinload(ReviewRequest.category),
            selectinload(ReviewRequest.target_post).selectinload(Post.category),
            selectinload(ReviewRequest.target_project),
            selectinload(ReviewRequest.review_request_coaches).selectinload(ReviewRequestCoach.coach),
        )
        .where(ReviewRequest.id == review_request_id)
    )


def list_requests_by_requester(db: Session, requester_id: int) -> list[ReviewRequest]:
    return list(
        db.scalars(
            select(ReviewRequest)
            .options(
                selectinload(ReviewRequest.requester),
                selectinload(ReviewRequest.category),
                selectinload(ReviewRequest.target_post).selectinload(Post.category),
                selectinload(ReviewRequest.target_project),
                selectinload(ReviewRequest.review_request_coaches).selectinload(ReviewRequestCoach.coach),
            )
            .where(ReviewRequest.requester_id == requester_id)
            .order_by(ReviewRequest.created_at.desc())
        )
    )


def list_requests_for_coach(db: Session, coach: User) -> list[ReviewRequest]:
    query = (
        select(ReviewRequest)
        .options(
            selectinload(ReviewRequest.requester),
            selectinload(ReviewRequest.category),
            selectinload(ReviewRequest.target_post).selectinload(Post.category),
            selectinload(ReviewRequest.target_project),
            selectinload(ReviewRequest.review_request_coaches).selectinload(ReviewRequestCoach.coach),
        )
        .order_by(ReviewRequest.created_at.desc())
    )

    if coach.role != ROLE_ADMIN:
        query = query.join(ReviewRequest.review_request_coaches).where(ReviewRequestCoach.coach_id == coach.id)

    return list(db.scalars(query))


def is_assigned_coach(review_request: ReviewRequest, current_user: User) -> bool:
    if current_user.role == ROLE_ADMIN:
        return True

    return any(link.coach_id == current_user.id for link in review_request.review_request_coaches)


def update_review_request(
    db: Session,
    review_request: ReviewRequest,
    status: str | None,
    feedback: str | None,
) -> ReviewRequest:
    """
    코치가 리뷰 상태와 피드백을 저장한다.
    """

    if status is not None:
        review_request.status = status

    if feedback is not None:
        review_request.feedback = feedback

    db.commit()

    return get_review_request_by_id(db=db, review_request_id=review_request.id) or review_request


def delete_pending_request(db: Session, review_request: ReviewRequest) -> None:
    """
    대기 중인 요청을 취소한다.
    """

    db.execute(delete(ReviewRequestCoach).where(ReviewRequestCoach.review_request_id == review_request.id))
    # ReviewRequest.review_request_coaches 관계가 이미 로드된 상태에서 db.delete(review_request)를 호출하면
    # SQLAlchemy가 연결 테이블의 복합 PK를 NULL로 맞추려 할 수 있다.
    # 그래서 취소는 연결 테이블과 본문 테이블을 모두 bulk delete로 처리한다.
    db.execute(delete(ReviewRequest).where(ReviewRequest.id == review_request.id))
    db.commit()
