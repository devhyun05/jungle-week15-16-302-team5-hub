from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.db.models import PortfolioProject, PortfolioProjectPost, Post, User


ROLE_ADMIN = "ADMIN"


def list_projects_by_owner(db: Session, owner_id: int) -> list[PortfolioProject]:
    """
    현재 학생이 등록한 포트폴리오 프로젝트 목록을 조회한다.
    """

    return list(
        db.scalars(
            select(PortfolioProject)
            .options(selectinload(PortfolioProject.portfolio_project_posts))
            .where(PortfolioProject.owner_id == owner_id)
            .order_by(PortfolioProject.updated_at.desc())
        )
    )


def get_project_by_id(
    db: Session,
    project_id: int,
    current_user: User,
) -> PortfolioProject | None:
    """
    현재 사용자가 접근할 수 있는 프로젝트 하나를 조회한다.
    """

    filters = [PortfolioProject.id == project_id]

    if current_user.role != ROLE_ADMIN:
        filters.append(PortfolioProject.owner_id == current_user.id)

    return db.scalar(
        select(PortfolioProject)
        .options(selectinload(PortfolioProject.portfolio_project_posts))
        .where(*filters)
    )


def get_project_by_owner_and_repo(
    db: Session,
    owner_id: int,
    repo_full_name: str,
) -> PortfolioProject | None:
    """
    같은 사용자가 같은 GitHub repo를 중복 등록했는지 확인한다.
    """

    normalized_repo_full_name = repo_full_name.lower()

    return db.scalar(
        select(PortfolioProject).where(
            PortfolioProject.owner_id == owner_id,
            func.lower(PortfolioProject.repo_full_name) == normalized_repo_full_name,
        )
    )


def create_project(
    db: Session,
    owner: User,
    title: str,
    repo_full_name: str,
    github_url: str,
    summary: str | None,
    tech_stack: str | None,
) -> PortfolioProject:
    """
    GitHub repo 하나를 포트폴리오 프로젝트로 등록한다.
    """

    project = PortfolioProject(
        owner=owner,
        title=title,
        repo_full_name=repo_full_name,
        github_url=github_url,
        summary=summary,
        tech_stack=tech_stack,
        readme_summary="GitHub README는 AI 생성 단계에서 참고 자료로 사용할 예정입니다.",
        recent_commit_summary="GitHub 프로젝트 등록 완료. 실제 커밋 분석은 MCP/GitHub API 연결 후 갱신합니다.",
        saved_portfolio_draft="아직 저장된 포트폴리오 글 초안이 없습니다. AI 도우미에서 초안을 생성해보세요.",
        portfolio_status="작성중",
        coach_feedback_status="요청 전",
        github_connected=True,
        ai_draft_saved=False,
    )
    db.add(project)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ValueError("이미 등록된 GitHub 프로젝트입니다.") from error

    db.refresh(project)

    return project


def update_project(
    db: Session,
    project: PortfolioProject,
    title: str | None,
    summary: str | None,
    tech_stack: str | None,
    portfolio_status: str | None,
    saved_portfolio_draft: str | None,
) -> PortfolioProject:
    """
    포트폴리오 프로젝트의 학생 관리 필드를 수정한다.
    """

    if title is not None:
        project.title = title

    if summary is not None:
        project.summary = summary

    if tech_stack is not None:
        project.tech_stack = tech_stack

    if portfolio_status is not None:
        project.portfolio_status = portfolio_status

    if saved_portfolio_draft is not None:
        project.saved_portfolio_draft = saved_portfolio_draft
        project.ai_draft_saved = True

    db.commit()
    db.refresh(project)

    return project


def replace_project_posts(
    db: Session,
    project: PortfolioProject,
    post_ids: list[int],
    current_user: User,
) -> PortfolioProject:
    """
    프로젝트와 연결된 게시글 목록을 교체한다.
    """

    unique_post_ids = list(dict.fromkeys(post_ids))

    if unique_post_ids:
        filters = [
            Post.id.in_(unique_post_ids),
            Post.deleted_at.is_(None),
        ]

        if current_user.role != ROLE_ADMIN:
            filters.append(Post.author_id == current_user.id)

        matched_post_ids = set(db.scalars(select(Post.id).where(*filters)))

        if matched_post_ids != set(unique_post_ids):
            raise ValueError("연결할 수 없는 게시글이 포함되어 있습니다.")

    db.execute(delete(PortfolioProjectPost).where(PortfolioProjectPost.project_id == project.id))

    for post_id in unique_post_ids:
        db.add(PortfolioProjectPost(project_id=project.id, post_id=post_id))

    db.commit()
    db.refresh(project)

    return get_project_by_id(db=db, project_id=project.id, current_user=current_user) or project
