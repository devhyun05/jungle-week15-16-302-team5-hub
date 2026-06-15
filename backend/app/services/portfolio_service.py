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
from app.services import github_service


VALID_PORTFOLIO_STATUSES = {"작성중", "보완 필요", "정리 완료"}
LEGACY_README_PLACEHOLDERS = {"GitHub README는 AI 생성 단계에서 참고 자료로 사용할 예정입니다."}
LEGACY_COMMIT_PLACEHOLDERS = {"GitHub 프로젝트 등록 완료. 실제 커밋 분석은 MCP/GitHub API 연결 후 갱신합니다."}
LEGACY_DRAFT_PLACEHOLDERS = {"아직 저장된 포트폴리오 글 초안이 없습니다. AI 도우미에서 초안을 생성해보세요."}
LEGACY_TECH_STACK_PLACEHOLDERS = {"분석 예정"}


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

    existing_project = portfolio_repository.get_project_by_owner_and_repo(
        db=db,
        owner_id=current_user.id,
        repo_full_name=repo_full_name,
    )

    if existing_project is not None:
        raise ValueError("이미 등록된 GitHub 프로젝트입니다.")

    analysis = github_service.analyze_repository(repo_full_name)
    title = request.title.strip() if request.title else analysis.title
    summary = request.summary if request.summary is not None else analysis.summary
    tech_stack = request.tech_stack or analysis.tech_stack

    project = portfolio_repository.create_project(
        db=db,
        owner=current_user,
        title=title,
        repo_full_name=analysis.repo_full_name,
        github_url=analysis.github_url,
        summary=summary,
        tech_stack=serialize_text_list(tech_stack),
        readme_summary=analysis.readme_summary,
        recent_commit_summary=serialize_text_list(analysis.recent_commit_summary),
        last_commit_at=analysis.last_commit_at,
    )

    return build_project_response(project)


def refresh_github_project(
    db: Session,
    project_id: int,
    current_user: User,
) -> PortfolioProjectResponse | None:
    """
    이미 등록된 프로젝트의 GitHub README, 언어, 최근 커밋 정보를 다시 조회해 저장한다.
    """

    project = portfolio_repository.get_project_by_id(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if project is None:
        return None

    analysis = github_service.analyze_repository(project.repo_full_name)
    updated_project = portfolio_repository.update_github_analysis(
        db=db,
        project=project,
        title=analysis.title,
        repo_full_name=analysis.repo_full_name,
        github_url=analysis.github_url,
        summary=analysis.summary,
        tech_stack=serialize_text_list(analysis.tech_stack),
        readme_summary=analysis.readme_summary,
        recent_commit_summary=serialize_text_list(analysis.recent_commit_summary),
        last_commit_at=analysis.last_commit_at,
    )

    return build_project_response(updated_project)


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


def normalize_optional_text(text: str | None, placeholders: set[str]) -> str | None:
    """
    과거 개발 단계에서 DB에 저장한 안내 문구를 실제 데이터처럼 응답하지 않는다.
    """

    if text is None:
        return None

    stripped_text = text.strip()

    if not stripped_text or stripped_text in placeholders:
        return None

    return text


def parse_recent_commit_summary(text: str | None) -> list[str]:
    """
    저장된 최근 커밋 요약에서 과거 개발 안내 문구를 제거하고 화면용 배열로 바꾼다.
    """

    return [line for line in parse_text_list(text) if line not in LEGACY_COMMIT_PLACEHOLDERS]


def parse_tech_stack(text: str | None) -> list[str]:
    """
    기술 스택 응답에서 과거 placeholder 성격의 값을 제거한다.
    """

    return [line for line in parse_text_list(text) if line not in LEGACY_TECH_STACK_PLACEHOLDERS]


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
        tech_stack=parse_tech_stack(project.tech_stack),
        readme_summary=normalize_optional_text(project.readme_summary, LEGACY_README_PLACEHOLDERS),
        recent_commit_summary=parse_recent_commit_summary(project.recent_commit_summary),
        saved_portfolio_draft=normalize_optional_text(project.saved_portfolio_draft, LEGACY_DRAFT_PLACEHOLDERS),
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
