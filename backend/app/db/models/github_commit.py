from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GitHubCommit(Base):
    """
    GitHub commit message를 프로젝트별로 저장하는 테이블 모델이다.

    diff 원문은 v1 RAG 재료에서 제외하고, 포트폴리오/면접 질문 생성에 필요한
    commit message, author, 시간, GitHub 링크만 저장한다.
    """

    __tablename__ = "github_commits"
    __table_args__ = (
        UniqueConstraint("project_id", "sha", name="uq_github_commits_project_sha"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("portfolio_projects.id"), nullable=False, index=True)
    sha: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    author_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    committed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    html_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["PortfolioProject"] = relationship(back_populates="github_commits")
