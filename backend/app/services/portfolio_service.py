from dataclasses import dataclass
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.db.models import PortfolioProject, Post, User
from app.repositories import notification_repository, portfolio_repository, post_repository
from app.schemas.portfolio import (
    PortfolioProjectCreateRequest,
    PortfolioProjectListResponse,
    PortfolioProjectPostLinkRequest,
    PortfolioProjectResponse,
    PortfolioProjectUpdateRequest,
)
from app.services import github_service
from app.services.post_service import normalize_tag_names


VALID_PORTFOLIO_STATUSES = {"작성중", "보완 필요", "정리 완료"}
LEGACY_README_PLACEHOLDERS = {"GitHub README는 AI 생성 단계에서 참고 자료로 사용할 예정입니다."}
LEGACY_COMMIT_PLACEHOLDERS = {"GitHub 프로젝트 등록 완료. 실제 커밋 분석은 MCP/GitHub API 연결 후 갱신합니다."}
LEGACY_DRAFT_PLACEHOLDERS = {"아직 저장된 포트폴리오 글 초안이 없습니다. AI 도우미에서 초안을 생성해보세요."}
LEGACY_TECH_STACK_PLACEHOLDERS = {"분석 예정"}


@dataclass
class GitHubProjectReference:
    """
    사용자가 입력한 GitHub URL에서 포트폴리오 등록에 필요한 repo/branch를 분리한 값이다.
    """

    repo_full_name: str
    github_branch: str | None


def get_portfolio_projects(db: Session, current_user: User) -> PortfolioProjectListResponse:
    """
    현재 사용자의 포트폴리오 프로젝트 목록을 응답으로 만든다.
    """

    projects = portfolio_repository.list_projects_by_owner(
        db=db,
        owner_id=current_user.id,
    )
    projects = [ensure_project_branch(project=project, db=db) for project in projects]
    projects = [sync_project_review_status(project=project, db=db) for project in projects]

    return PortfolioProjectListResponse(
        items=[build_project_response(project) for project in projects],
        total=len(projects),
    )


def sync_project_review_status(project: PortfolioProject, db: Session) -> PortfolioProject:
    """
    포트폴리오 프로젝트 카드의 코치 상태를 최신 리뷰 요청 상태와 맞춘다.

    `포트폴리오 프로젝트`로 요청한 경우뿐 아니라, 프로젝트가 발행한
    `포트폴리오 관리` 게시글로 리뷰 요청한 경우도 같은 프로젝트 상태로 본다.
    """

    latest_review_status = portfolio_repository.get_latest_project_review_status(
        db=db,
        project=project,
    )

    if latest_review_status is None or latest_review_status == project.coach_feedback_status:
        return project

    return portfolio_repository.update_project_coach_feedback_status(
        db=db,
        project=project,
        coach_feedback_status=latest_review_status,
    )


def ensure_project_branch(project: PortfolioProject, db: Session) -> PortfolioProject:
    """
    과거 branch 컬럼이 없던 시절에 등록된 프로젝트를 GitHub default branch 기준으로 보정한다.

    외부 API 실패 때문에 목록 화면 전체가 깨지면 안 되므로,
    보정에 실패하면 현재 프로젝트 값을 그대로 사용한다.
    """

    if project.github_branch:
        return project

    try:
        analysis = github_service.analyze_repository(project.repo_full_name)
    except (github_service.GitHubApiError, github_service.GitHubRepositoryNotFoundError):
        return portfolio_repository.update_project_branch(
            db=db,
            project=project,
            github_branch="main",
        )

    updated_project = portfolio_repository.update_github_analysis(
        db=db,
        project=project,
        title=analysis.title,
        repo_full_name=analysis.repo_full_name,
        github_branch=analysis.github_branch,
        github_url=analysis.github_url,
        summary=analysis.summary,
        tech_stack=serialize_text_list(analysis.tech_stack),
        readme_summary=analysis.readme_summary,
        readme_content=analysis.readme_content,
        recent_commit_summary=serialize_text_list(analysis.recent_commit_summary),
        last_commit_at=analysis.last_commit_at,
    )

    return portfolio_repository.replace_github_commits(
        db=db,
        project=updated_project,
        commits=serialize_commit_messages(analysis.commit_messages),
    )


def create_portfolio_project(
    db: Session,
    request: PortfolioProjectCreateRequest,
    current_user: User,
) -> PortfolioProjectResponse:
    """
    GitHub repo URL을 프로젝트로 등록한다.
    """

    project_reference = parse_github_project_reference(request.github_url)
    analysis = github_service.analyze_repository(
        repo_full_name=project_reference.repo_full_name,
        github_branch=project_reference.github_branch,
    )

    existing_project = portfolio_repository.get_project_by_owner_and_repo(
        db=db,
        owner_id=current_user.id,
        repo_full_name=analysis.repo_full_name,
        github_branch=analysis.github_branch,
    )

    if existing_project is not None:
        raise ValueError("이미 등록된 GitHub 프로젝트입니다.")

    title = request.title.strip() if request.title else analysis.title
    summary = request.summary if request.summary is not None else analysis.summary
    tech_stack = request.tech_stack or analysis.tech_stack

    project = portfolio_repository.create_project(
        db=db,
        owner=current_user,
        title=title,
        repo_full_name=analysis.repo_full_name,
        github_branch=analysis.github_branch,
        github_url=analysis.github_url,
        summary=summary,
        tech_stack=serialize_text_list(tech_stack),
        readme_summary=analysis.readme_summary,
        readme_content=analysis.readme_content,
        recent_commit_summary=serialize_text_list(analysis.recent_commit_summary),
        last_commit_at=analysis.last_commit_at,
    )
    project = portfolio_repository.replace_github_commits(
        db=db,
        project=project,
        commits=serialize_commit_messages(analysis.commit_messages),
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

    analysis = github_service.analyze_repository(
        repo_full_name=project.repo_full_name,
        github_branch=project.github_branch,
    )
    updated_project = portfolio_repository.update_github_analysis(
        db=db,
        project=project,
        title=analysis.title,
        repo_full_name=analysis.repo_full_name,
        github_branch=analysis.github_branch,
        github_url=analysis.github_url,
        summary=analysis.summary,
        tech_stack=serialize_text_list(analysis.tech_stack),
        readme_summary=analysis.readme_summary,
        readme_content=analysis.readme_content,
        recent_commit_summary=serialize_text_list(analysis.recent_commit_summary),
        last_commit_at=analysis.last_commit_at,
    )
    updated_project = portfolio_repository.replace_github_commits(
        db=db,
        project=updated_project,
        commits=serialize_commit_messages(analysis.commit_messages),
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


def delete_portfolio_project(
    db: Session,
    project_id: int,
    current_user: User,
) -> bool:
    """
    현재 사용자가 접근할 수 있는 포트폴리오 프로젝트를 삭제한다.

    발행된 게시글은 게시판 기록으로 남기고, 프로젝트 등록/연결/리뷰 요청/GitHub 커밋 데이터만 제거한다.
    """

    project = portfolio_repository.get_project_by_id(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if project is None:
        return False

    portfolio_repository.delete_project(db=db, project=project)

    return True


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


def publish_portfolio_post(
    db: Session,
    project_id: int,
    is_public: bool,
    current_user: User,
) -> PortfolioProjectResponse | None:
    """
    포트폴리오 프로젝트 내용을 기반으로 `포트폴리오 관리` 카테고리 게시글을 생성하거나 갱신한다.
    """

    project = portfolio_repository.get_project_by_id(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if project is None:
        return None

    category = post_repository.get_category_by_slug(
        db=db,
        category_slug="portfolio",
    )

    if category is None:
        raise ValueError("포트폴리오 관리 카테고리를 찾을 수 없습니다.")

    title = build_portfolio_post_title(project)
    content = build_portfolio_post_content(project)
    summary = build_portfolio_post_summary(project)
    tag_names = normalize_tag_names(["포트폴리오", project.title, project.github_branch or "main"])
    related_github_url = build_project_branch_url(project)
    existing_post = (
        post_repository.get_post_for_update(db=db, post_id=project.published_post_id)
        if project.published_post_id
        else None
    )

    if existing_post is None:
        post = post_repository.create_post(
            db=db,
            author=project.owner,
            category=category,
            title=title,
            summary=summary,
            content=content,
            tag_names=tag_names,
            is_public=is_public,
            related_commit=related_github_url,
        )
        publish_status = "created"
    elif is_same_published_post(
        post=existing_post,
        category_id=category.id,
        title=title,
        summary=summary,
        content=content,
        tag_names=tag_names,
        related_github_url=related_github_url,
        is_public=is_public,
    ):
        return build_project_response(project, publish_status="unchanged")
    else:
        post = post_repository.update_post(
            db=db,
            post=existing_post,
            category=category,
            title=title,
            summary=summary,
            content=content,
            tag_names=tag_names,
            is_public=is_public,
            related_commit=related_github_url,
        )
        publish_status = "updated"

    updated_project = portfolio_repository.update_published_post(
        db=db,
        project=project,
        post=post,
    )

    notification_repository.create_notification(
        db=db,
        user_id=current_user.id,
        notification_type="portfolio-publish",
        message=(
            f"{project.title} 포트폴리오 게시글을 발행했습니다."
            if publish_status == "created"
            else f"{project.title} 포트폴리오 게시글을 최신 내용으로 갱신했습니다."
        ),
        link_url=f"/posts/{post.id}",
    )

    return build_project_response(updated_project, publish_status=publish_status)


def build_portfolio_post_title(project: PortfolioProject) -> str:
    """
    포트폴리오 게시글 목록과 상세에 자연스럽게 보일 제목을 만든다.
    """

    title = project.title.strip()

    return title if title.endswith(" 포트폴리오") else f"{title} 포트폴리오"


def is_same_published_post(
    post: Post,
    category_id: int,
    title: str,
    summary: str | None,
    content: str,
    tag_names: list[str],
    related_github_url: str,
    is_public: bool,
) -> bool:
    """
    이미 발행된 포트폴리오 게시글이 새로 만들 내용과 같은지 확인한다.

    같으면 update를 생략해 updated_at만 바뀌는 불필요한 DB 갱신을 막는다.
    """

    current_tag_names = {post_tag.tag.name for post_tag in post.post_tags if post_tag.tag is not None}

    return (
        post.category_id == category_id
        and post.title == title
        and (post.summary or "") == (summary or "")
        and post.content == content
        and post.is_public == is_public
        and (post.related_commit or "") == related_github_url
        and current_tag_names == set(tag_names)
    )


def build_project_branch_url(project: PortfolioProject) -> str:
    """
    GitHub repo URL과 branch를 사람이 열어볼 수 있는 URL로 조합한다.
    """

    branch = project.github_branch or "main"
    github_url = normalize_github_repository_url(project.github_url)

    return f"{github_url}/tree/{branch}"


def normalize_github_repository_url(github_url: str) -> str:
    """
    GitHub URL에서 `/tree/{branch}`나 `/blob/{branch}` 이하를 제거해 repo 기본 URL로 맞춘다.

    과거 데이터에 branch URL이 그대로 저장돼 있어도 포트폴리오 게시글 발행 링크가
    `/tree/dev/tree/main`처럼 중복되지 않게 방어한다.
    """

    parsed_url = urlparse(github_url.strip())

    if not parsed_url.netloc:
        return github_url.rstrip("/")

    path_parts = [part for part in parsed_url.path.split("/") if part]

    if len(path_parts) >= 2:
        repository_path = "/".join(path_parts[:2])
        return f"{parsed_url.scheme}://{parsed_url.netloc}/{repository_path}".rstrip("/")

    return github_url.rstrip("/")


def build_portfolio_post_summary(project: PortfolioProject) -> str:
    """
    포트폴리오 게시글 목록에 보여줄 요약을 만든다.
    """

    summary_parts = [
        project.summary or f"{project.title} 프로젝트 포트폴리오 글입니다.",
        f"GitHub: {project.repo_full_name} ({project.github_branch or 'main'})",
        f"기술 스택: {', '.join(parse_tech_stack(project.tech_stack)) or '등록 전'}",
    ]

    return " / ".join(summary_parts)[:500]


def build_portfolio_post_content(project: PortfolioProject) -> str:
    """
    전체 게시글/내 기록 상세에서 보여줄 포트폴리오 글 본문을 만든다.
    """

    linked_posts = [link.post for link in project.portfolio_project_posts if link.post is not None and link.post.deleted_at is None]
    linked_record_text = "\n".join(
        f"- [{post.category.label}] {post.title}: {post.summary or post.content[:120]}"
        for post in linked_posts
    ) or "- 아직 연결된 학습 기록이 없습니다."
    commit_text = "\n".join(f"- {commit}" for commit in parse_recent_commit_summary(project.recent_commit_summary)) or "- 아직 최근 커밋 요약이 없습니다."
    all_commit_text = "\n".join(
        f"- {commit.message}"
        for commit in sorted(
            project.github_commits,
            key=lambda github_commit: github_commit.committed_at or github_commit.created_at,
            reverse=True,
        )
    ) or "- 아직 수집된 커밋 메시지가 없습니다."
    portfolio_text = normalize_optional_text(project.saved_portfolio_draft, LEGACY_DRAFT_PLACEHOLDERS)
    interview_text = normalize_optional_text(project.saved_interview_questions, set())

    return f"""# {project.title}

## GitHub
- Repository: {project.repo_full_name}
- Branch: {project.github_branch or "main"}
- URL: {build_project_branch_url(project)}

## 기술 스택
{", ".join(parse_tech_stack(project.tech_stack)) or "아직 기술 스택이 등록되지 않았습니다."}

## 프로젝트 설명
{project.summary or "아직 프로젝트 설명이 없습니다."}

## 연결된 학습 기록
{linked_record_text}

## 최근 커밋 요약
{commit_text}

## 전체 커밋 메시지
{all_commit_text}

## 코치 피드백 상태
{project.coach_feedback_status}

## 면접 예상 질문
{interview_text or "아직 저장된 면접 예상 질문이 없습니다. AI 도우미에서 면접 질문을 생성해보세요."}

## 포트폴리오 글
{portfolio_text or "아직 작성된 포트폴리오 글이 없습니다. AI 도우미 또는 직접 작성으로 내용을 채워주세요."}
"""


def parse_github_project_reference(github_url: str) -> GitHubProjectReference:
    """
    GitHub URL에서 owner/repo와 선택적 branch 값을 추출한다.
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

    github_branch = None

    if len(parts) >= 4 and parts[2] in {"tree", "blob"}:
        github_branch = "/".join(parts[3:]).strip() or None

    return GitHubProjectReference(
        repo_full_name=f"{parts[0]}/{parts[1]}".lower(),
        github_branch=github_branch,
    )


def parse_repo_full_name(github_url: str) -> str:
    """
    기존 호출부와 테스트 호환을 위해 owner/repo만 반환한다.
    """

    return parse_github_project_reference(github_url).repo_full_name


def serialize_text_list(items: list[str]) -> str:
    """
    list[str]를 Text column에 저장하기 위한 줄바꿈 문자열로 바꾼다.
    """

    return "\n".join(item.strip() for item in items if item.strip())


def serialize_commit_messages(commits: list[github_service.GitHubCommitMessage]) -> list[dict[str, object]]:
    """
    GitHubCommitMessage 목록을 repository 저장용 dict 목록으로 바꾼다.
    """

    return [
        {
            "sha": commit.sha,
            "message": commit.message,
            "author_name": commit.author_name,
            "committed_at": commit.committed_at,
            "html_url": commit.html_url,
        }
        for commit in commits
    ]


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


def build_project_response(project: PortfolioProject, publish_status: str | None = None) -> PortfolioProjectResponse:
    """
    PortfolioProject model을 프론트가 바로 쓰기 좋은 JSON 응답으로 바꾼다.
    """

    linked_post_ids = [link.post_id for link in project.portfolio_project_posts]
    github_commits = sorted(
        project.github_commits,
        key=lambda commit: commit.committed_at or commit.created_at,
        reverse=True,
    )

    return PortfolioProjectResponse(
        id=project.id,
        title=project.title,
        published_post_id=project.published_post_id,
        published_post_is_public=project.published_post.is_public if project.published_post is not None else None,
        publish_status=publish_status,
        repo_full_name=project.repo_full_name,
        github_branch=project.github_branch or "main",
        github_url=project.github_url,
        summary=project.summary,
        tech_stack=parse_tech_stack(project.tech_stack),
        readme_summary=normalize_optional_text(project.readme_summary, LEGACY_README_PLACEHOLDERS),
        readme_content_saved=bool(normalize_optional_text(project.readme_content, set())),
        recent_commit_summary=parse_recent_commit_summary(project.recent_commit_summary),
        github_commits=[
            {
                "sha": commit.sha,
                "message": commit.message,
                "authorName": commit.author_name,
                "committedAt": commit.committed_at,
                "htmlUrl": commit.html_url,
            }
            for commit in github_commits
        ],
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
