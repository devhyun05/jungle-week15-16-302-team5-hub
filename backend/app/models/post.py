from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import get_settings
from app.db.base import Base


def get_post_image_sort_order():
    from app.models.post_image import PostImage

    return PostImage.sort_order


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    seller_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    trade_location: Mapped[str] = mapped_column(String(40), nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False, default="기타")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="selling")
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    images = relationship(
        "PostImage",
        back_populates="post",
        cascade="all, delete-orphan",
        order_by=get_post_image_sort_order,
    )
    seller = relationship("User")

    @property
    def seller_slack_enabled(self) -> bool:
        if not self.seller or not self.seller.slack_user_id:
            return False

        allowed_slack_team_id = get_settings().allowed_slack_team_id
        if not allowed_slack_team_id:
            return True

        return self.seller.slack_team_id == allowed_slack_team_id

    @property
    def seller_initial(self) -> str:
        if self.seller and self.seller.username:
            return self.seller.username.strip()[:1].upper()

        return str(self.seller_id)[:1]
