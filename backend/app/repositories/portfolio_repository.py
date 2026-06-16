from datetime import datetime

from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.db.models import PortfolioProject, PortfolioProjectPost, Post, PostCategory, User


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
    github_branch: str,
) -> PortfolioProject | None:
    """
    같은 사용자가 같은 GitHub repo/branch를 중복 등록했는지 확인한다.
    """

    normalized_repo_full_name = repo_full_name.lower()
    normalized_github_branch = github_branch.lower()

    return db.scalar(
        select(PortfolioProject).where(
            PortfolioProject.owner_id == owner_id,
            func.lower(PortfolioProject.repo_full_name) == normalized_repo_full_name,
            func.lower(PortfolioProject.github_branch) == normalized_github_branch,
        )
    )


def create_project(
    db: Session,
    owner: User,
    title: str,
    repo_full_name: str,
    github_branch: str,
    github_url: str,
    summary: str | None,
    tech_stack: str | None,
    readme_summary: str | None = None,
    recent_commit_summary: str | None = None,
    last_commit_at: datetime | None = None,
) -> PortfolioProject:
    """
    GitHub repo 하나를 포트폴리오 프로젝트로 등록한다.
    """

    project = PortfolioProject(
        owner=owner,
        title=title,
        repo_full_name=repo_full_name,
        github_branch=github_branch,
        github_url=github_url,
        summary=summary,
        tech_stack=tech_stack,
        readme_summary=readme_summary,
        recent_commit_summary=recent_commit_summary,
        saved_portfolio_draft=None,
        saved_interview_questions=None,
        portfolio_status="작성중",
        coach_feedback_status="요청 전",
        github_connected=True,
        ai_draft_saved=False,
        last_commit_at=last_commit_at,
    )
    db.add(project)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ValueError("이미 등록된 GitHub 프로젝트입니다.") from error

    db.refresh(project)

    return project


def update_github_analysis(
    db: Session,
    project: PortfolioProject,
    title: str,
    repo_full_name: str,
    github_branch: str,
    github_url: str,
    summary: str | None,
    tech_stack: str | None,
    readme_summary: str | None,
    recent_commit_summary: str | None,
    last_commit_at: datetime | None,
) -> PortfolioProject:
    """
    GitHub API에서 다시 가져온 repo 분석 결과를 프로젝트에 저장한다.

    학생이 직접 작성하는 포트폴리오 초안/상태와
    GitHub에서 자동으로 가져오는 참고 정보가 섞이지 않도록 별도 함수로 분리했다.
    """

    project.title = title
    project.repo_full_name = repo_full_name
    project.github_branch = github_branch
    project.github_url = github_url
    project.summary = summary
    project.tech_stack = tech_stack
    project.readme_summary = readme_summary
    project.recent_commit_summary = recent_commit_summary
    project.last_commit_at = last_commit_at
    project.github_connected = True

    db.commit()
    db.refresh(project)

    return project


def update_project_branch(
    db: Session,
    project: PortfolioProject,
    github_branch: str,
) -> PortfolioProject:
    """
    과거 데이터 보정용으로 branch 값만 저장한다.
    """

    project.github_branch = github_branch

    db.commit()
    db.refresh(project)

    return project


def update_published_post(
    db: Session,
    project: PortfolioProject,
    post: Post,
) -> PortfolioProject:
    """
    포트폴리오 프로젝트가 대표로 발행한 게시글 id를 저장한다.
    """

    project.published_post_id = post.id

    db.commit()
    db.refresh(project)

    return get_project_by_id(db=db, project_id=project.id, current_user=project.owner) or project


def update_project(
    db: Session,
    project: PortfolioProject,
    title: str | None,
    summary: str | None,
    tech_stack: str | None,
    portfolio_status: str | None,
    saved_portfolio_draft: str | None,
    saved_interview_questions: str | None,
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

    if saved_interview_questions is not None:
        project.saved_interview_questions = saved_interview_questions

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

        portfolio_post_ids = set(
            db.scalars(
                select(Post.id)
                .join(PostCategory, Post.category_id == PostCategory.id)
                .where(*filters, PostCategory.slug == "portfolio")
            )
        )

        if portfolio_post_ids:
            raise ValueError("포트폴리오 게시글은 연결 기록으로 추가할 수 없습니다.")

        matched_post_ids = set(db.scalars(select(Post.id).where(*filters)))

        if matched_post_ids != set(unique_post_ids):
            raise ValueError("연결할 수 없는 게시글이 포함되어 있습니다.")

    db.execute(delete(PortfolioProjectPost).where(PortfolioProjectPost.project_id == project.id))

    for post_id in unique_post_ids:
        db.add(PortfolioProjectPost(project_id=project.id, post_id=post_id))

    db.commit()
    db.refresh(project)

    return get_project_by_id(db=db, project_id=project.id, current_user=current_user) or project
