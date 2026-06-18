# ForeignKey는 프로젝트와 게시글을 각각 참조하기 위해 사용한다.
from sqlalchemy import BigInteger, ForeignKey
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 양쪽 모델 객체 접근에 사용한다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# portfolio_project_posts는 portfolio_projects와 posts의 N:M 연결 테이블이다.
# "이 프로젝트는 이 게시글을 참고 기록으로 연결했다"를 저장한다.
class PortfolioProjectPost(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "portfolio_project_posts"

    # 연결할 프로젝트 id다. post_id와 묶어 복합 PK로 사용한다.
    project_id: Mapped[int] = mapped_column(ForeignKey("portfolio_projects.id"), primary_key=True)
    # 연결할 게시글 id다. 같은 프로젝트에 같은 글이 중복 연결되는 것을 복합 PK가 막는다.
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), primary_key=True)

    # PortfolioProjectPost -> PortfolioProject 관계다.
    project: Mapped["PortfolioProject"] = relationship(back_populates="portfolio_project_posts")
    # PortfolioProjectPost -> Post 관계다.
    post: Mapped["Post"] = relationship(back_populates="portfolio_project_posts")
