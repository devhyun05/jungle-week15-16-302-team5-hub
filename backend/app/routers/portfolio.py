from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.dependencies.auth import require_roles
from app.schemas.portfolio import (
    PortfolioProjectPublishRequest,
    PortfolioProjectCreateRequest,
    PortfolioProjectListResponse,
    PortfolioProjectPostLinkRequest,
    PortfolioProjectResponse,
    PortfolioProjectUpdateRequest,
)
from app.services.github_service import GitHubApiError, GitHubRepositoryNotFoundError
from app.services import portfolio_service


router = APIRouter(prefix="/portfolio/projects", tags=["portfolio"])


@router.get("", response_model=PortfolioProjectListResponse)
def get_portfolio_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> PortfolioProjectListResponse:
    """
    현재 사용자의 포트폴리오 프로젝트 목록을 반환한다.
    """

    return portfolio_service.get_portfolio_projects(
        db=db,
        current_user=current_user,
    )


@router.post("", response_model=PortfolioProjectResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio_project(
    request: PortfolioProjectCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> PortfolioProjectResponse:
    """
    GitHub repo URL을 포트폴리오 프로젝트로 등록한다.
    """

    try:
        return portfolio_service.create_portfolio_project(
            db=db,
            request=request,
            current_user=current_user,
        )
    except GitHubRepositoryNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except GitHubApiError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.patch("/{project_id}", response_model=PortfolioProjectResponse)
def update_portfolio_project(
    project_id: int,
    request: PortfolioProjectUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> PortfolioProjectResponse:
    """
    포트폴리오 프로젝트 상태와 초안 내용을 수정한다.
    """

    try:
        project = portfolio_service.update_portfolio_project(
            db=db,
            project_id=project_id,
            request=request,
            current_user=current_user,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if project is None:
        raise HTTPException(status_code=404, detail="포트폴리오 프로젝트를 찾을 수 없습니다.")

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> None:
    """
    포트폴리오 프로젝트 등록을 삭제한다.
    """

    is_deleted = portfolio_service.delete_portfolio_project(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )

    if not is_deleted:
        raise HTTPException(status_code=404, detail="포트폴리오 프로젝트를 찾을 수 없습니다.")


@router.post("/{project_id}/github/refresh", response_model=PortfolioProjectResponse)
def refresh_github_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> PortfolioProjectResponse:
    """
    GitHub API를 다시 호출해 프로젝트의 README, 언어, 최근 커밋 정보를 갱신한다.
    """

    try:
        project = portfolio_service.refresh_github_project(
            db=db,
            project_id=project_id,
            current_user=current_user,
        )
    except GitHubRepositoryNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except GitHubApiError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    if project is None:
        raise HTTPException(status_code=404, detail="포트폴리오 프로젝트를 찾을 수 없습니다.")

    return project


@router.put("/{project_id}/posts", response_model=PortfolioProjectResponse)
def link_project_posts(
    project_id: int,
    request: PortfolioProjectPostLinkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> PortfolioProjectResponse:
    """
    프로젝트와 연결된 게시글 목록을 저장한다.
    """

    try:
        project = portfolio_service.link_project_posts(
            db=db,
            project_id=project_id,
            request=request,
            current_user=current_user,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if project is None:
        raise HTTPException(status_code=404, detail="포트폴리오 프로젝트를 찾을 수 없습니다.")

    return project


@router.post("/{project_id}/publish-post", response_model=PortfolioProjectResponse)
def publish_portfolio_post(
    project_id: int,
    request: PortfolioProjectPublishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT", "ADMIN")),
) -> PortfolioProjectResponse:
    """
    포트폴리오 프로젝트 내용을 기반으로 전체 게시글에 보일 포트폴리오 글을 발행하거나 갱신한다.
    """

    try:
        project = portfolio_service.publish_portfolio_post(
            db=db,
            project_id=project_id,
            is_public=request.is_public,
            current_user=current_user,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if project is None:
        raise HTTPException(status_code=404, detail="포트폴리오 프로젝트를 찾을 수 없습니다.")

    return project
