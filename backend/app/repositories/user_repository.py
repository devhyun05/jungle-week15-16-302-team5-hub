from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User


ROLE_ADMIN = "ADMIN"
ROLE_STUDENT = "STUDENT"

APPROVAL_APPROVED = "승인 완료"
APPROVAL_PENDING = "승인 대기"


def get_admin_email_set() -> set[str]:
    """
    .env의 ADMIN_EMAILS 문자열을 비교하기 쉬운 set으로 바꾼다.

    예를 들어 `.env`에 `ADMIN_EMAILS=a@test.com,b@test.com`처럼 저장하면
    여기서는 {"a@test.com", "b@test.com"} 형태로 만든다.
    최초 관리자 계정을 DB에 수동으로 넣지 않아도, 지정한 이메일로 Google 로그인하면
    자동으로 ADMIN/승인 완료 상태가 되게 하기 위한 헬퍼다.
    """

    return {
        email.strip().lower()
        for email in settings.admin_emails.split(",")
        if email.strip()
    }


def is_initial_admin_email(email: str) -> bool:
    """
    Google에서 받은 이메일이 초기 관리자 이메일인지 확인한다.

    Google 이메일은 대소문자가 섞여 올 수 있으므로 lower()로 맞춰 비교한다.
    """

    return email.lower() in get_admin_email_set()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """
    users.id로 사용자 한 명을 조회한다.

    나중에 JWT access token의 sub 값에는 user_id가 들어간다.
    /auth/me 같은 API는 token에서 user_id를 꺼낸 뒤 이 함수로 실제 User row를 찾는다.
    """

    return db.scalar(select(User).where(User.id == user_id))


def get_user_by_google_sub(db: Session, google_sub: str) -> User | None:
    """
    Google 고유 사용자 id인 sub 값으로 사용자를 조회한다.

    이메일은 사용자가 바꾸거나 조직 정책에 따라 달라질 수 있지만,
    google_sub는 Google 계정의 안정적인 식별자라 로그인 매칭 기준으로 더 적합하다.
    """

    return db.scalar(select(User).where(User.google_sub == google_sub))


def get_user_by_email(db: Session, email: str) -> User | None:
    """
    이메일로 사용자를 조회한다.

    보통 로그인 기준은 google_sub지만, 관리자 승인 목록이나 중복 계정 방지 상황에서는
    email로도 사용자를 찾을 일이 있다.
    """

    return db.scalar(select(User).where(User.email == email.lower()))


def create_google_user(
    db: Session,
    email: str,
    google_sub: str,
    name: str,
    profile_image_url: str | None,
) -> User:
    """
    Google OAuth로 처음 로그인한 사용자를 users 테이블에 생성한다.

    초기 관리자 이메일이면 ADMIN/승인 완료로 만들고,
    그 외 사용자는 STUDENT/승인 대기로 만든다.
    JungleLog는 정글 수강생/코치만 쓰는 서비스라 아무 Google 계정이나 바로 쓰게 하지 않고
    관리자 승인 단계를 둔다.
    """

    normalized_email = email.lower()

    if is_initial_admin_email(normalized_email):
        role = ROLE_ADMIN
        approval_status = APPROVAL_APPROVED
    else:
        role = ROLE_STUDENT
        approval_status = APPROVAL_PENDING

    user = User(
        email=normalized_email,
        google_sub=google_sub,
        name=name[:50],
        profile_image_url=profile_image_url,
        role=role,
        approval_status=approval_status,
        last_login_at=datetime.now(timezone.utc),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_google_login_user(
    db: Session,
    user: User,
    email: str,
    profile_image_url: str | None,
) -> User:
    """
    이미 가입된 사용자가 다시 Google 로그인했을 때 갱신할 값만 갱신한다.

    주의할 점은 name을 매번 Google 이름으로 덮어쓰지 않는 것이다.
    users.name은 JungleLog 안에서 사용자가 수정할 수 있는 표시 이름이므로,
    Google 재로그인 때문에 사용자가 바꾼 이름이 사라지면 안 된다.
    """

    user.email = email.lower()
    user.profile_image_url = profile_image_url
    user.last_login_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

    return user


def get_or_create_google_user(
    db: Session,
    email: str,
    google_sub: str,
    name: str,
    profile_image_url: str | None,
) -> User:
    """
    Google profile을 기준으로 JungleLog 사용자를 조회하거나 생성한다.

    OAuth callback에서는 Google에게서 받은 profile이 DB에 이미 있으면 기존 사용자를 쓰고,
    없으면 새 users row를 만든다.
    """

    user = get_user_by_google_sub(db=db, google_sub=google_sub)

    if user is None:
        return create_google_user(
            db=db,
            email=email,
            google_sub=google_sub,
            name=name,
            profile_image_url=profile_image_url,
        )

    return update_google_login_user(
        db=db,
        user=user,
        email=email,
        profile_image_url=profile_image_url,
    )
