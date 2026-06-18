# BigInteger는 posts/tags의 bigint id 타입에 맞추기 위해 사용한다.
# ForeignKey는 post_tags가 posts와 tags를 참조하게 만든다.
from sqlalchemy import BigInteger, ForeignKey
# Mapped/mapped_column은 ORM 컬럼 선언, relationship은 양쪽 모델 객체 접근에 사용한다.
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 모든 SQLAlchemy 모델의 공통 부모다.
from app.db.base import Base


# post_tags는 posts와 tags의 N:M 관계를 풀기 위한 연결 테이블이다.
class PostTag(Base):
    # 실제 테이블 이름이다.
    __tablename__ = "post_tags"

    # 연결할 게시글 id다. post_id와 tag_id를 묶어 복합 PK로 사용한다.
    post_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("posts.id"), primary_key=True)
    # 연결할 태그 id다. 같은 게시글에 같은 태그가 중복으로 붙는 것을 복합 PK가 막는다.
    tag_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tags.id"), primary_key=True)

    # PostTag -> Post 방향 관계다. 반대편 Post.post_tags와 연결된다.
    post: Mapped["Post"] = relationship(back_populates="post_tags")
    # PostTag -> Tag 방향 관계다. 반대편 Tag.post_tags와 연결된다.
    tag: Mapped["Tag"] = relationship(back_populates="post_tags")
