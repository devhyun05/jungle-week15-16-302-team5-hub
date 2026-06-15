from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.db.models import PortfolioProject, User
from app.repositories import portfolio_repository
from app.schemas.portfolio import (
    PortfolioProjectCreateRequest,
    PortfolioProjectListResponse,
    PortfolioProjectPostLinkRequest,
    PortfolioProjectResponse,
    PortfolioProjectUpdateRequest,
)


VALID_PORTFOLIO_STATUSES = {"작성중", "보완 필요", "정리 완료"}


def get_portfolio_projects(db: Session, current_user: User) -> PortfolioProjectListResponse:
    """
    현재 사용자의 포트폴리오 프로젝트 목록을 응답으로 만든다.
    """

    projects = portfolio_repository.list_projects_by_owner(
        db=db,
        owner_id=current_user.id,
    )

    return PortfolioProjectListResponse(
        items=[build_project_response(project) for project in projects],
        total=len(projects),
    )


def create_portfolio_project(
    db: Session,
    request: PortfolioProjectCreateRequest,
    current_user: User,
) -> PortfolioProjectResponse:
    """
    GitHub repo URL을 프로젝트로 등록한다.
    """

    repo_full_name = parse_repo_full_name(request.github_url)
    title = request.title.strip() if request.title else repo_full_name.split("/")[-1]
    tech_stack = serialize_text_list(request.tech_stack or ["GitHub", "분석 예정"])

    existing_project = portfolio_repository.get_project_by_owner_and_repo(
        db=db,
        owner_id=current_user.id,
        repo_full_name=repo_full_name,
    )

    if existing_project is not None:
        raise ValueError("이미 등록된 GitHub 프로젝트입니다.")

    project = portfolio_repository.create_project(
        db=db,
        owner=current_user,
        title=title,
        repo_full_name=repo_full_name,
        github_url=request.github_url,
        summary=request.summary,
        tech_stack=tech_stack,
    )

    return build_project_response(project)


def update_portfolio_project(
    db: Session,
    project_id: int,
    request: PortfolioProjectUpdateRequest,
    current_user: User,
) -> PortfolioProjectResponse | None:
    """
    프로젝트 상태, 요약, 포트폴리오 초안을 수정한다.
    """

    project = portfolio_repository.get_project_by_id(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if project is None:
        return None

    if request.portfolio_status is not None and request.portfolio_status not in VALID_PORTFOLIO_STATUSES:
        raise ValueError("존재하지 않는 포트폴리오 상태입니다.")

    updated_project = portfolio_repository.update_project(
        db=db,
        project=project,
        title=request.title,
        summary=request.summary,
        tech_stack=serialize_text_list(request.tech_stack) if request.tech_stack is not None else None,
        portfolio_status=request.portfolio_status,
        saved_portfolio_draft=request.saved_portfolio_draft,
        saved_interview_questions=request.saved_interview_questions,
    )

    return build_project_response(updated_project)


def link_project_posts(
    db: Session,
    project_id: int,
    request: PortfolioProjectPostLinkRequest,
    current_user: User,
) -> PortfolioProjectResponse | None:
    """
    프로젝트와 내 게시글 연결 목록을 저장한다.
    """

    project = portfolio_repository.get_project_by_id(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if project is None:
        return None

    updated_project = portfolio_repository.replace_project_posts(
        db=db,
        project=project,
        post_ids=request.post_ids,
        current_user=current_user,
    )

    return build_project_response(updated_project)


def parse_repo_full_name(github_url: str) -> str:
    """
    GitHub URL에서 owner/repo 값을 추출한다.
    """

    normalized_url = github_url.strip().removesuffix(".git")

    if not normalized_url:
        raise ValueError("GitHub repo URL을 입력해 주세요.")

    parsed_url = urlparse(normalized_url)

    if parsed_url.netloc:
        if "github.com" not in parsed_url.netloc:
            raise ValueError("GitHub URL만 등록할 수 있습니다.")

        path = parsed_url.path.strip("/")
    else:
        path = normalized_url.replace("github.com/", "").strip("/")

    parts = [part for part in path.split("/") if part]

    if len(parts) < 2:
        raise ValueError("GitHub URL은 owner/repository 형식이어야 합니다.")

    return f"{parts[0]}/{parts[1]}".lower()


def serialize_text_list(items: list[str]) -> str:
    """
    list[str]를 Text column에 저장하기 위한 줄바꿈 문자열로 바꾼다.
    """

    return "\n".join(item.strip() for item in items if item.strip())


def parse_text_list(text: str | None) -> list[str]:
    """
    Text column에 저장된 줄바꿈 문자열을 프론트용 list[str]로 바꾼다.
    """

    if not text:
        return []

    return [line.strip() for line in text.splitlines() if line.strip()]


def build_project_response(project: PortfolioProject) -> PortfolioProjectResponse:
    """
    PortfolioProject model을 프론트가 바로 쓰기 좋은 JSON 응답으로 바꾼다.
    """

    linked_post_ids = [link.post_id for link in project.portfolio_project_posts]

    return PortfolioProjectResponse(
        id=project.id,
        title=project.title,
        repo_full_name=project.repo_full_name,
        github_url=project.github_url,
        summary=project.summary,
        tech_stack=parse_text_list(project.tech_stack),
        readme_summary=project.readme_summary,
        recent_commit_summary=parse_text_list(project.recent_commit_summary),
        saved_portfolio_draft=project.saved_portfolio_draft,
        saved_interview_questions=project.saved_interview_questions,
        portfolio_status=project.portfolio_status,
        coach_feedback_status=project.coach_feedback_status,
        github_connected=project.github_connected,
        ai_draft_saved=project.ai_draft_saved,
        ai_interview_saved=bool(project.saved_interview_questions),
        last_commit_at=project.last_commit_at,
        linked_post_ids=linked_post_ids,
        linked_record_count=len(linked_post_ids),
        created_at=project.created_at,
        updated_at=project.updated_at,
    )
