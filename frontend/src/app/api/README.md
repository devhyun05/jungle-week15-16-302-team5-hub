# api

백엔드 API 호출 함수를 모아두는 폴더입니다.

현재 연결된 API 영역:

- `auth.ts`: Google OAuth 로그인 시작, `/auth/me`, refresh, logout
- `posts.ts`: 게시글 목록/상세/작성/수정/삭제, 내 기록 조회
- `comments.ts`: 댓글 조회/작성/삭제
- `admin.ts`: 사용자 승인/역할 변경
- `portfolio.ts`: 포트폴리오 프로젝트 등록/조회/수정, 프로젝트-게시글 연결
- `reviews.ts`: 코치 리뷰 요청 생성/조회/수정/취소

아직 남은 API 영역:

- 알림 API
- 프로필 설정 저장 API
- GitHub MCP 분석 API
- OpenAI/RAG/Agent API