# 프로젝트 등록/커밋/수정 시간을 저장하기 위해 datetime 타입을 사용한다.
from datetime import datetime

# BigInteger는 큰 정수 id, Boolean은 연결/저장 여부, DateTime은 시간,
# ForeignKey는 owner_id 연결, String은 짧은 문자열, Text는 긴 요약/초안,
# UniqueConstraint는 같은 사용자의 같은 repo/branch 중복 등록을 막고, func는 now() 기본값에 사용한다.
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 다른 모델과 객체 관계를 만든다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# portfolio_projects 테이블 모델이다.
# GitHub repo의 branch 하나를 JungleLog 포트폴리오 프로젝트 하나로 관리한다.
class PortfolioProject(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "portfolio_projects"
    # 테이블 레벨 제약 조건이다.
    # 같은 학생(owner_id)이 같은 repo_full_name/github_branch 조합을 두 번 등록하지 못하게 한다.
    __table_args__ = (
        UniqueConstraint("owner_id", "repo_full_name", "github_branch", name="uq_portfolio_projects_owner_repo_branch"),
    )

    # 포트폴리오 프로젝트 고유 id다.
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 프로젝트 소유 학생 id다. users.id를 참조한다.
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # 이 프로젝트에서 발행한 대표 포트폴리오 게시글 id다.
    published_post_id: Mapped[int | None] = mapped_column(ForeignKey("posts.id"), nullable=True)
    # 화면에 보여줄 프로젝트 이름이다.
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # GitHub owner/repo 형태의 고유 repo 이름이다.
    repo_full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    # GitHub 분석 기준 branch 이름이다.
    github_branch: Mapped[str] = mapped_column(String(200), nullable=False, default="main")
    # GitHub repo URL이다.
    github_url: Mapped[str] = mapped_column(String(500), nullable=False)
    # 프로젝트 카드의 짧은 설명이다.
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 기술 스택 문자열이다. v1에서는 text로 단순 저장한다.
    tech_stack: Mapped[str | None] = mapped_column(Text, nullable=True)
    # GitHub README 요약이다. AI 참고 자료로 사용한다.
    readme_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    # GitHub README 원문 전체다. 화면에는 요약만 보여주고 AI/RAG 재료로는 원문을 사용한다.
    readme_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 최근 커밋 요약이다. GitHub 분석 결과로 채워질 예정이다.
    recent_commit_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    # AI 도우미가 만든 포트폴리오 글 초안 저장 위치다.
    saved_portfolio_draft: Mapped[str | None] = mapped_column(Text, nullable=True)
    # AI 도우미가 만든 면접 예상 질문 저장 위치다.
    saved_interview_questions: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 학생이 직접 관리하는 포트폴리오 상태다.
    portfolio_status: Mapped[str] = mapped_column(String(30), nullable=False, default="작성중")
    # 코치 리뷰 상태다. 학생이 임의로 바꾸는 값이 아니라 리뷰 흐름에서 갱신된다.
    coach_feedback_status: Mapped[str] = mapped_column(String(30), nullable=False, default="요청 전")
    # GitHub repo가 연결됐는지 여부다.
    github_connected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # AI 초안이 저장됐는지 여부다.
    ai_draft_saved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # GitHub에서 확인한 마지막 커밋 시각이다.
    last_commit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # 프로젝트 등록 시각이다.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # 프로젝트 수정 시각이다.
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # PortfolioProject -> User 관계다. project.owner.name처럼 소유자에 접근할 수 있다.
    owner: Mapped["User"] = relationship(back_populates="portfolio_projects")
    # PortfolioProject -> PortfolioProjectPost 목록 관계다. 연결된 게시글은 이 중간 테이블을 거친다.
    portfolio_project_posts: Mapped[list["PortfolioProjectPost"]] = relationship(back_populates="project")
    # PortfolioProject -> Post 관계다. 전체 게시글/내 기록에서 볼 대표 포트폴리오 글을 가리킨다.
    published_post: Mapped["Post | None"] = relationship(foreign_keys=[published_post_id])
    # PortfolioProject -> ReviewRequest 목록 관계다. 프로젝트가 코치 리뷰 대상일 수 있다.
    review_requests: Mapped[list["ReviewRequest"]] = relationship(back_populates="target_project")
    # PortfolioProject -> GitHubCommit 목록 관계다. AI/RAG 재료로 사용할 commit message들을 담는다.
    github_commits: Mapped[list["GitHubCommit"]] = relationship(back_populates="project")
