# JungleLog

## 2026-06-14 최신 구현: 게시글 수정 API와 수정 화면 연결

`PATCH /posts/{post_id}`를 구현하고 `/posts/:id/edit` 화면을 백엔드 API에 연결했습니다.

- `backend/app/schemas/post.py`: 수정 요청 body인 `PostUpdateRequest`를 추가했습니다.
- `backend/app/repositories/post_repository.py`: 수정 대상 게시글 조회와 posts/post_tags 갱신 로직을 추가했습니다.
- `backend/app/services/post_service.py`: 제목/본문 검증, 카테고리 확인, 태그 정리, 상세 응답 변환 흐름을 추가했습니다.
- `backend/app/routers/posts.py`: `PATCH /posts/{post_id}` endpoint를 추가했습니다.
- `frontend/src/app/api/posts.ts`: `updatePost` API 호출 함수를 추가했습니다.
- `frontend/src/app/pages/posts/PostEdit.tsx`: 수정 화면에서 기존 글을 API로 불러오고, 수정 완료 시 PATCH API를 호출하도록 변경했습니다.

현재 게시글 CRUD 중 생성/조회/수정은 API와 화면이 연결되어 있습니다. 삭제는 다음 단계에서 `DELETE /posts/{post_id}`와 상세 화면의 삭제 버튼을 연결할 예정입니다.

## 2026-06-14 최신 구현: 게시글 목록/상세 API 전환

게시글 목록과 상세 화면을 mock data 중심에서 백엔드 API 응답 중심으로 전환했습니다.

- `frontend/src/app/api/posts.ts`: `getPosts`, `getPostDetail` 조회 함수를 추가했습니다.
- `frontend/src/app/pages/posts/Posts.tsx`: 카테고리/검색어를 `GET /posts` query string으로 전달하고 API 응답 목록을 렌더링합니다.
- `frontend/src/app/pages/posts/PostDetail.tsx`: URL의 id로 `GET /posts/{post_id}`를 호출해 상세 데이터를 렌더링합니다.
- `frontend/src/app/pages/posts/PostEdit.tsx`: 새 글 발행 성공 후 생성된 상세 페이지 `/posts/{id}`로 이동합니다.

이제 `POST /posts`로 생성된 게시글이 `/posts` 목록에 보이고, `/posts/{id}` 상세 화면에서도 열립니다. 게시글 수정/삭제는 아직 mock이며 다음 CRUD 단계에서 `PATCH /posts/{id}`, `DELETE /posts/{id}`로 연결할 예정입니다.

## 2026-06-14 최신 구현: 게시글 작성 API와 글쓰기 화면 연결

`POST /posts`를 구현하고 `/posts/new`의 발행 버튼을 백엔드 API에 연결했습니다.

- `backend/app/schemas/post.py`: `PostCreateRequest`를 추가해 게시글 작성 request body를 검증합니다.
- `backend/app/repositories/post_repository.py`: demo 작성자 조회, 카테고리 조회, 태그 생성/재사용, 게시글 INSERT 로직을 추가했습니다.
- `backend/app/services/post_service.py`: 제목/본문 공백 검증, summary 자동 생성, 태그 중복 제거, 응답 변환을 담당합니다.
- `backend/app/routers/posts.py`: `POST /posts` endpoint를 추가하고 `201 Created`, `400`, `404`, `500` 응답을 구분합니다.
- `frontend/src/app/api/posts.ts`: 게시글 작성 API 호출 함수를 추가했습니다.
- `frontend/src/app/pages/posts/PostEdit.tsx`: 새 글 발행 버튼이 백엔드 API를 호출하도록 연결했습니다.

현재는 JWT/OAuth2 전 단계라 게시글 작성자는 `demo.student@junglelog.local` seed 사용자로 저장됩니다. 수정/삭제 API와 목록/상세 화면의 완전한 API 전환은 다음 CRUD 단계에서 진행합니다.

## 2026-06-13 최신 구현: 댓글 작성 API와 프론트 연결

댓글 조회 다음 단계로 `POST /posts/{post_id}/comments`를 구현하고 게시글 상세 화면의 댓글 작성 버튼을 백엔드 API에 연결했습니다.

- `backend/app/schemas/comment.py`: `CommentCreateRequest`를 추가해 댓글 작성 요청 body를 검증합니다.
- `backend/app/repositories/comment_repository.py`: demo 작성자 조회와 comments 테이블 INSERT 로직을 추가했습니다.
- `backend/app/services/comment_service.py`: 게시글 존재 확인, 공백 댓글 검증, demo user 기반 댓글 작성 흐름을 담당합니다.
- `backend/app/routers/comments.py`: `POST /posts/{post_id}/comments` endpoint를 추가하고 `201 Created`, `400`, `404`, `500` 응답을 구분합니다.
- `frontend/src/app/api/comments.ts`: `createPostComment` API 함수를 추가했습니다.
- `frontend/src/app/pages/posts/PostDetail.tsx`: 댓글 작성 버튼이 local mock이 아니라 백엔드 POST API를 호출하고, 성공한 댓글을 화면 state에 추가합니다.

현재는 JWT/OAuth2 전 단계라 댓글 작성자는 `demo.student@junglelog.local` seed 사용자로 저장됩니다. 실제 로그인 사용자 기준 댓글 작성, 본인 댓글 삭제 권한, 코치/관리자 권한 처리는 JWT/OAuth2 구현 후 연결할 예정입니다.

React, FastAPI, PostgreSQL 기반 게시판에 AI 응용 기능을 결합하는 개인 과제 프로젝트입니다.

JungleLog는 정글 수강생이 학습 기록, 트러블슈팅, 프로젝트 회고, 면접 질문, 포트폴리오 자료를 관리하고 코치가 기록을 보고 피드백할 수 있는 AI 게시판을 목표로 합니다.

## 현재 구현 상태

React mock UI 1차 구현을 마치고, 현재는 **게시글 조회 API 설계와 구현 단계**를 진행 중입니다.
프론트엔드는 아직 실제 API 저장 없이 `mockData`와 `useState`로 화면 흐름을 확인하며, 백엔드는 기본 health API와 DB 연결 확인 API까지 구현했습니다.

구현된 화면/기능:

- STUDENT / COACH mock role 전환
- ADMIN mock role 전환
- 승인 상태 `승인 완료 / 승인 대기 / 거절 / 정지` mock 전환
- 역할/승인상태 전환기는 개발용 mock UI이며 실제 서비스에서는 노출하지 않음
- 역할별 사이드바 메뉴 분기
- 접근 제한 UI
- Google OAuth 단일 로그인 정책에 맞춘 로그인 mock 화면
- Google mock 로그인 클릭 시 신규 학생이 `승인 대기` 상태로 이동하는 흐름
- 승인 대기 화면
- 관리자 사용자 승인 mock 화면
- 상단 알림 드롭다운
- 동작하지 않는 전역 헤더 검색 UI 제거
- 대시보드 CTA 라우트 연결
- 전체 게시글 목록, 카테고리 필터, 검색
- 게시글 상세 mock data 연결
- 게시글 작성 / 수정 / 삭제 mock 동작
- 댓글 작성 mock 동작
- 내 기록 필터와 검색
- 포트폴리오 프로젝트 검색
- GitHub 프로젝트 등록 mock 동작
- 포트폴리오 프로젝트별 연결 기록 표시
- 기록 연결하기 mock UI
- 포트폴리오 상태 변경 mock UI
- AI 도우미 프로젝트 선택 기반 생성 UI
- 포트폴리오 글 / 면접 예상 질문 mock 생성
- 코치 리뷰 요청 생성/취소 mock UI
- 코치 리뷰 인박스 검색/필터/상태 변경/피드백 전송 mock UI
- STUDENT / COACH 화면이 같은 mock 리뷰 요청 원본 state를 공유하고 role에 맞게 필터링하도록 개선
- 코치 리뷰 상태 `최종 확인` 추가

## 현재 라우트

| Route | 화면 | 접근 |
| --- | --- | --- |
| `/` | 학생/코치 대시보드, 관리자는 사용자 승인으로 이동 | STUDENT, COACH, ADMIN |
| `/login` | Google 로그인 | 공통 |
| `/pending-approval` | 승인 대기 / 승인 상태 안내 | 미승인 사용자 |
| `/admin/users` | 사용자 승인 관리 | ADMIN |
| `/posts` | 전체 게시글 | STUDENT, COACH, ADMIN |
| `/posts?category=learning-log` | 학습 로그 필터 목록 | STUDENT, COACH, ADMIN |
| `/posts/:id` | 게시글 상세 | STUDENT, COACH, ADMIN |
| `/posts/new` | 게시글 작성 | STUDENT, ADMIN |
| `/posts/:id/edit` | 게시글 수정 | STUDENT, ADMIN |
| `/my-records` | 내 기록 | STUDENT, ADMIN |
| `/portfolio` | 포트폴리오 관리 | STUDENT, ADMIN |
| `/ai-assistant` | AI 도우미 | STUDENT, ADMIN |
| `/coach-review` | 학생: 리뷰 요청 / 코치: 리뷰 인박스 / 관리자: 전체 요청 확인 | STUDENT, COACH, ADMIN |
| `/settings` | 설정 | STUDENT, COACH, ADMIN |

## 현재 화면 구성

```txt
frontend/src/app/
  api/             백엔드 API 호출 함수 위치
  components/      공통 UI 컴포넌트
  contexts/        전역 상태 Context 위치
  data/            mock data
  hooks/           재사용 hook 위치
  layouts/         AuthLayout, MainLayout
  pages/
    ai/            AI 도우미
    admin/         사용자 승인 관리
    auth/          Google 로그인 / 승인 대기
    coach/         코치 리뷰
    dashboard/     대시보드
    portfolio/     포트폴리오 관리
    posts/         게시글 / 내 기록
    settings/      설정
  types/           공통 타입 위치
  routes.tsx       라우트 정의
```

자세한 구조 기준은 [docs/project-structure.md](docs/project-structure.md)에 정리합니다.
프로젝트 전체 진행 상황과 다음 단계 판단 기준은 [docs/agent/log.md](docs/agent/log.md)에 기록합니다.

## Mock UI에서 동작하는 것

- `useState`로 입력값, 선택값, 검색어, 필터 상태를 관리합니다.
- `mockData.ts`의 posts, portfolioProjects, reviewRequests, notifications를 화면에 연결합니다.
- 관리자 사용자 승인은 `userAccounts` mock state에만 반영됩니다.
- 관리자 화면에서 역할을 선택한 뒤 `승인 적용`을 누르면 선택한 역할과 `승인 완료` 상태가 함께 mock 반영됩니다.
- 승인 상태 문제가 있으면 승인 상태 안내 화면으로, 승인 완료 후 role이 맞지 않으면 역할 접근 제한 안내로 분리해 보여줍니다.
- 검색은 현재 전체 게시글, 내 기록, 포트폴리오, 코치 리뷰처럼 각 화면 안의 mock 검색창에서만 동작합니다.
- 게시글 작성/수정/삭제는 실제 저장 없이 안내 문구와 라우트 이동만 수행합니다.
- 댓글 작성은 현재 상세 화면의 local state에만 추가됩니다.
- 리뷰 요청 취소는 `대기 중` 상태일 때 mock 목록에서 제거됩니다.
- 코치가 피드백과 상태를 전송하면 같은 mock `requests` state를 통해 학생 요청 목록에서도 확인할 수 있습니다.
- 코치 인박스는 mock `currentCoachId`에 배정된 리뷰 요청만 먼저 필터링한 뒤 검색/상태/카테고리 필터를 적용합니다.
- 기록 연결하기는 현재 포트폴리오 화면의 local state만 변경합니다.
- AI 도우미 저장은 실제 DB 저장 없이 mock 안내 문구만 표시합니다.

## 백엔드 현재 상태

- FastAPI / Uvicorn 기반 백엔드 가상환경을 구성했습니다.
- `GET /health` API가 `status`, `service` 응답을 반환합니다.
- `GET /health/db` API가 PostgreSQL에 `SELECT 1`을 실행해 DB 연결 상태를 확인합니다.
- `GET /posts` API가 공개 게시글 목록을 페이지네이션 응답으로 반환합니다.
- `GET /posts/{post_id}` API가 id에 맞는 공개 게시글 상세를 반환합니다.
- `PATCH /posts/{post_id}` API가 게시글 제목/본문/카테고리/태그/공개 여부를 수정합니다.
- `GET /posts/{post_id}/comments` API가 게시글 댓글 목록을 반환합니다.
- `/docs` Swagger 문서에서 `HealthResponse` schema를 확인할 수 있습니다.
- `/docs` Swagger 문서에서 `DatabaseHealthResponse` schema와 `/health/db` endpoint를 확인할 수 있습니다.
- `/docs` Swagger 문서에서 `PostListResponse`, `PostDetailResponse` schema와 posts endpoint를 확인할 수 있습니다.
- `/docs` Swagger 문서에서 `CommentListResponse` schema와 comments endpoint를 확인할 수 있습니다.
- `.env`, `config.py`, `.env.example` 기반으로 앱 이름, CORS origin, `DATABASE_URL` 설정을 분리했습니다.
- Docker Compose로 PostgreSQL 16 컨테이너 `junglelog-postgres`를 실행했습니다.
- SQLAlchemy / psycopg 기반 DB engine, session, `get_db()` 의존성 함수를 구성했습니다.
- [docs/agent/db-design.md](docs/agent/db-design.md)에 Google OAuth, 관리자 승인, 게시판, 포트폴리오, 코치 리뷰 요청을 포함한 ERD v1을 정리했습니다.
- ERD v1에서 `role`과 `approval_status`를 분리하고, 승인 이력은 `user_approval_logs`에 남기도록 설계했습니다.

## 백엔드 연결 후 구현 예정

- Google OAuth 로그인 / 첫 로그인 자동 가입
- Google 로그인 성공 후 자체 JWT 발급
- JWT 기반 role 판별과 라우트 보호
- 운영자 승인 상태 기반 API 접근 제한
- 초기 관리자 `ADMIN_EMAILS` 처리
- 사용자 승인 / 거절 / 정지 / role 변경 API
- 게시글 삭제 API
- 댓글 저장 / 삭제 API
- 태그 API
- 페이징 API
- DB full-text search
- 포트폴리오 프로젝트 저장 / 조회 API
- 프로젝트-게시글 연결 저장 API
- 코치 리뷰 요청 생성 / 취소 / 상태 변경 API
- 알림 API
- GitHub API 또는 MCP 기반 repo 분석
- OpenAI API 호출
- RAG 검색과 요약
- Agent 실행 루프

## 실행 방법

자세한 로컬 세팅 과정과 명령어 기록은 [docs/agent/setup.md](docs/agent/setup.md)에 정리합니다.

프론트엔드 개발 서버:

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 빌드 확인:

```bash
cd frontend
npm run build
```

로컬 PostgreSQL 실행:

```bash
docker compose up -d
```

백엔드 개발 서버:

```bash
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

## 코드 컨벤션과 문서화 기준

- 구현 전 [docs/agent/code.md](docs/agent/code.md)를 먼저 확인합니다.
- 세팅 명령어와 설치 과정은 [docs/agent/setup.md](docs/agent/setup.md)에 기록합니다.
- K&R brace 스타일을 지킵니다.
- 제어문 중괄호를 생략하지 않습니다.
- 함수/변수명은 의미가 드러나게 작성합니다.
- 불필요한 주석은 피하고, 백엔드 연결 예정 부분은 `TODO backend`로 구분합니다.
- 구현이 끝나면 README와 [docs/agent/study.md](docs/agent/study.md)를 함께 업데이트합니다.
- 단계 진행 상황이 바뀌면 [docs/agent/log.md](docs/agent/log.md)에 현재 상태와 다음 단계를 기록합니다.
- 구현 중 등장한 학습 키워드는 [docs/agent/front-keyword.md](docs/agent/front-keyword.md)와 [docs/agent/back-keyword.md](docs/agent/back-keyword.md)에 나누어 기록합니다.
- 구현 후에는 [docs/agent/test.md](docs/agent/test.md)의 QA 체크리스트를 돌리고, 실제 문제와 해결 과정은 [docs/agent/troubleshooting.md](docs/agent/troubleshooting.md)에 기록합니다.

## 다음 작업 예정

1. `GET /posts`, `GET /posts/{post_id}` API Swagger와 실제 응답 QA
2. 게시글 작성 / 수정 / 삭제 API 설계와 구현
3. 댓글 작성 / 삭제 API 설계와 구현
4. Google OAuth 로그인 / 자동 가입 / JWT 발급 구현
5. 사용자 승인 / role 변경 API 구현
6. 프론트 mock data를 실제 API 응답으로 교체
7. GitHub MCP, RAG, AI Agent 기능 순차 연결

## 최근 DB 설계 QA

- 현재 React mock 화면 기준으로 ERD v1 매핑 QA를 진행했습니다.
- 게시글/댓글/태그/포트폴리오/코치 리뷰/알림의 핵심 화면 데이터는 v1 테이블로 설명 가능합니다.
- 화면에서 쓰는 `MockPost.relatedCommit` 대응을 위해 `posts.related_commit`을 DB 설계에 추가했습니다.
- 포트폴리오 카드 요약인 `PortfolioProject.summary` 대응을 위해 `portfolio_projects.summary`를 DB 설계에 추가했습니다.
- 댓글 수, 연결 기록 수, 요청자 이름, 코치 이름, 리뷰 대상 제목은 중복 저장하지 않고 JOIN 또는 count 결과로 만들 예정입니다.

## DB 설계 학습 문서

- [docs/agent/db-design.md](docs/agent/db-design.md)에 ERD v1과 테이블 필드별 선언 이유를 정리했습니다.
- 각 필드가 왜 필요한지, 어떤 화면/기능과 연결되는지, 어떤 값은 저장하지 않고 JOIN/count로 만드는지 학습할 수 있습니다.

## 최근 백엔드 구현

- ERD v1을 기준으로 SQLAlchemy 모델 1차 구현을 시작했습니다.
- `backend/app/db/models/user.py`에 `users` 모델을 추가했습니다.
- `backend/app/db/models/post_category.py`에 `post_categories` 모델을 추가했습니다.
- `backend/app/db/models/post.py`에 `posts` 모델을 추가했습니다.
- `backend/app/db/models/__init__.py`에서 모델들을 한 번에 import할 수 있게 정리했습니다.
- 현재 단계에서는 실제 테이블 생성 전이며, Python 코드에 테이블 구조를 선언한 상태입니다.
- `Base.metadata.tables` 기준으로 `users`, `post_categories`, `posts`가 등록되는 것을 확인했습니다.

## 최근 DB 초기화 구현

- `backend/app/db/init_db.py`를 추가했습니다.
- `Base.metadata.create_all(bind=engine)`으로 SQLAlchemy 모델 기준 실제 PostgreSQL 테이블을 생성할 수 있게 했습니다.
- `users`, `post_categories`, `posts` 테이블 생성을 확인했습니다.
- 기본 게시글 카테고리 seed 데이터를 추가했습니다.
  - `learning-log`: 학습 로그
  - `troubleshooting`: 트러블슈팅
  - `retrospective`: 프로젝트 회고
  - `interview`: 면접 질문
  - `portfolio`: 포트폴리오 관리
- seed 명령을 여러 번 실행해도 카테고리가 중복 생성되지 않도록 처리했습니다.

## 최근 게시판 모델 확장

- `comments`, `tags`, `post_tags` SQLAlchemy 모델을 추가했습니다.
- `User.comments`, `Post.comments` 관계를 추가했습니다.
- `Post.post_tags`, `Tag.post_tags`, `PostTag.post`, `PostTag.tag` 관계를 추가했습니다.
- 실제 PostgreSQL에 `comments`, `tags`, `post_tags` 테이블 생성을 확인했습니다.
- 현재 실제 테이블 목록은 `users`, `post_categories`, `posts`, `comments`, `tags`, `post_tags`입니다.

## 최근 API 설계와 게시글 조회 구현

- [docs/agent/api-design.md](docs/agent/api-design.md)에 JungleLog API 설계 v1을 추가했습니다.
- 4단계 1차 범위는 게시글 목록/상세 조회 API로 제한했습니다.
- `backend/app/schemas/post.py`에 게시글 응답 Pydantic schema를 추가했습니다.
- `backend/app/repositories/post_repository.py`에 DB 조회 로직을 분리했습니다.
- `backend/app/services/post_service.py`에 DB 모델을 프론트 친화적인 응답 schema로 바꾸는 로직을 분리했습니다.
- `backend/app/routers/posts.py`에 `GET /posts`, `GET /posts/{post_id}` endpoint를 추가했습니다.
- `backend/app/db/init_db.py`에 개발용 demo 사용자/게시글/태그 seed를 추가했습니다.
- 게시글 조회 API 학습을 위해 router, service, repository, schema, init_db 흐름에 자세한 학습용 주석을 추가했습니다.

## 최근 DB 모델 완성

- ERD v1의 12개 테이블을 SQLAlchemy 모델로 모두 반영했습니다.
- 기존 6개 테이블 `users`, `post_categories`, `posts`, `comments`, `tags`, `post_tags`에 이어 아래 6개 모델을 추가했습니다.
  - `user_approval_logs`
  - `portfolio_projects`
  - `portfolio_project_posts`
  - `review_requests`
  - `review_request_coaches`
  - `notifications`
- `User`, `Post`, `PostCategory` 모델에 포트폴리오, 코치 리뷰, 알림, 승인 이력 관계를 연결했습니다.
- `init_db()` 실행 후 실제 PostgreSQL 테이블 12개 생성을 확인했습니다.

## 최근 댓글 조회 API와 프론트 연결

- `backend/app/schemas/comment.py`에 댓글 목록 응답 schema를 추가했습니다.
- `backend/app/repositories/comment_repository.py`에 게시글 존재 확인과 댓글 목록 조회 로직을 추가했습니다.
- `backend/app/services/comment_service.py`에 댓글 DB model을 API 응답으로 변환하는 흐름을 추가했습니다.
- `backend/app/routers/comments.py`에 `GET /posts/{post_id}/comments` endpoint를 추가했습니다.
- `frontend/src/app/api/comments.ts`에 댓글 조회 API 호출 함수를 추가했습니다.
- `PostDetail` 화면에서 백엔드 댓글 API를 호출해 댓글 목록 state에 반영하도록 연결했습니다.
- 댓글 조회 API는 실제 저장/작성 API 전 단계이며, 현재 댓글 작성 버튼은 아직 화면 local state mock 동작입니다.
