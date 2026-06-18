# 이 파일은 app.db.models 패키지를 import할 때 모든 모델 클래스를 함께 로드하기 위한 모음 파일이다.
# init_db.py에서 import app.db.models를 실행하면 아래 모델들이 모두 import되어 Base.metadata에 등록된다.

# refresh token 저장/폐기 테이블 모델
from app.db.models.auth_refresh_token import AuthRefreshToken
# 댓글 테이블 모델
from app.db.models.comment import Comment
# GitHub commit message 저장 테이블 모델
from app.db.models.github_commit import GitHubCommit
# 알림 테이블 모델
from app.db.models.notification import Notification
# 게시글 테이블 모델
from app.db.models.post import Post
# 게시글 카테고리 기준 테이블 모델
from app.db.models.post_category import PostCategory
# 게시글-태그 N:M 연결 테이블 모델
from app.db.models.post_tag import PostTag
# 포트폴리오 프로젝트 테이블 모델
from app.db.models.portfolio_project import PortfolioProject
# 포트폴리오 프로젝트-게시글 N:M 연결 테이블 모델
from app.db.models.portfolio_project_post import PortfolioProjectPost
from app.db.models.rag_document import RagDocument
# 코치 리뷰 요청 테이블 모델
from app.db.models.review_request import ReviewRequest
# 코치 리뷰 요청-코치 N:M 연결 테이블 모델
from app.db.models.review_request_coach import ReviewRequestCoach
# 태그 기준 테이블 모델
from app.db.models.tag import Tag
# 사용자 테이블 모델
from app.db.models.user import User
# 사용자 승인/권한 변경 이력 테이블 모델
from app.db.models.user_approval_log import UserApprovalLog

# __all__은 "이 패키지에서 공개적으로 사용할 이름 목록"을 의미한다.
# from app.db.models import User, Post 같은 import가 명확해진다.
__all__ = [
    "AuthRefreshToken",
    "Comment",
    "GitHubCommit",
    "Notification",
    "PortfolioProject",
    "PortfolioProjectPost",
    "Post",
    "PostCategory",
    "PostTag",
    "RagDocument",
    "ReviewRequest",
    "ReviewRequestCoach",
    "Tag",
    "User",
    "UserApprovalLog",
]
