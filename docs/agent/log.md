# JungleLog 진행 로그

이 문서는 구현을 진행하면서 어떤 작업을 했고, 어떤 검증을 했는지 기록한다. 상세한 트러블슈팅은 `troubleshooting.md`, 반복 QA 기준은 `test.md`, 학습 정리는 `study.md`에 분리한다.

## 2026-06-10 작업: React mock UI 라우트 안정화

상태: 완료

진행한 것:

- 주요 라우트가 열리도록 React Router 설정을 정리했다.
- `/signup`, `/posts/new`, `/posts/:id/edit`, `/coach-review` 같은 중복/별칭 라우트 의미를 정리했다.
- mock role 기반 STUDENT/COACH 화면 분기를 적용했다.
- 게시글 상세가 URL id에 맞는 mock post를 찾도록 정리했다.
- 내 기록/전체 게시글/포트폴리오/코치 리뷰 mock 필터와 검색을 연결했다.

검증:

- 모든 주요 화면이 열린다.
- 학생과 코치 사이드바 메뉴가 다르게 보인다.
- 접근 불가 화면에는 안내가 보인다.

## 2026-06-11 작업: 백엔드 기본 환경 설정

상태: 완료

진행한 것:

- Python 3.11 가상환경을 사용하기로 했다.
- FastAPI, Uvicorn, SQLAlchemy, psycopg를 설치했다.
- `backend/app/main.py`, `core/config.py`, `db/session.py`, `routers/health.py` 구조를 잡았다.
- `/health`, `/health/db` endpoint를 만들었다.
- Docker Compose로 PostgreSQL 16 컨테이너를 실행했다.

검증:

```txt
GET /health -> {"status":"ok", "service":"junglelog"}
GET /health/db -> {"status":"ok", "database":"postgresql"}
```

배운 점:

- `SessionLocal`은 요청마다 DB session을 만들기 위한 factory다.
- `engine`은 SQLAlchemy가 PostgreSQL과 연결하는 핵심 객체다.
- FastAPI `Depends`는 DB session 같은 공통 의존성을 endpoint에 주입한다.

## 2026-06-12 작업: DB 설계와 SQLAlchemy 모델 작성

상태: 완료

진행한 것:

- dbdiagram.io 기준 ERD v1을 설계했다.
- users, posts, comments, tags, post_categories, portfolio_projects, review_requests, notifications, user_approval_logs 등 주요 테이블을 정리했다.
- SQLAlchemy model 파일을 작성했다.
- `Base.metadata.create_all(bind=engine)` 흐름으로 모델을 실제 PostgreSQL 테이블로 반영했다.

검증:

- PostgreSQL container가 정상 실행된다.
- `/health/db`가 정상 응답한다.
- SQLAlchemy model import가 compile된다.

## 2026-06-13 작업: 게시글/댓글 API 구현

상태: 완료

진행한 것:

- 게시글 목록 조회 `GET /posts`
- 게시글 상세 조회 `GET /posts/{post_id}`
- 댓글 조회 `GET /posts/{post_id}/comments`
- 댓글 작성 `POST /posts/{post_id}/comments`
- 게시글 작성 `POST /posts`
- 게시글 수정 `PATCH /posts/{post_id}`
- 게시글 삭제 `DELETE /posts/{post_id}`
- 댓글 삭제 `DELETE /comments/{comment_id}`

프론트 연결:

- 게시글 목록/상세/작성/수정/삭제 화면을 API 기반으로 연결했다.
- 댓글 목록/작성/삭제를 게시글 상세 화면에 연결했다.

검증:

- Swagger UI에서 posts/comments API가 보인다.
- 공개 게시글 목록 조회가 성공한다.
- 없는 게시글은 404를 반환한다.
- 댓글은 `/posts/{post_id}/comments` 하위 resource로 동작한다.

커밋 예시:

```txt
feat: 게시글과 댓글 API 연결
```

## 2026-06-14 작업: Google OAuth/JWT 인증 설계와 구현

상태: 완료

진행한 것:

- JWT 보안 유틸을 추가했다.
- refresh token 저장 모델을 추가했다.
- Google OAuth callback 흐름을 구현했다.
- access/refresh token을 HttpOnly cookie로 내려주도록 했다.
- `/auth/me`, `/auth/refresh`, `/auth/logout`를 구현했다.
- 프론트 `AuthContext`와 `RoleGate`를 실제 인증 기반으로 정리했다.

결정한 방식:

- Google OAuth는 사용자 신원 확인에 사용한다.
- JungleLog 서비스 권한은 자체 users 테이블의 `role`, `approval_status`로 관리한다.
- 처음 로그인한 일반 사용자는 승인 대기 상태가 된다.
- `.env`의 `ADMIN_EMAILS`에 포함된 사용자는 최고관리자로 유지한다.

검증:

- Google login redirect가 동작한다.
- `/auth/me`가 현재 사용자 정보를 반환한다.
- 비로그인 상태에서 보호 화면 접근 시 login으로 이동한다.
- 승인 대기 사용자는 pending 화면으로 이동한다.

커밋 예시:

```txt
feat: Google OAuth 인증 흐름 연결
```

## 2026-06-15 작업: current_user 기반 권한 적용

상태: 완료

진행한 것:

- demo user 기반 작성자 처리에서 JWT current user 기반 처리로 바꿨다.
- 게시글 작성/수정/삭제 권한을 작성자 또는 ADMIN으로 제한했다.
- 댓글 작성/삭제 권한을 로그인 사용자 기준으로 제한했다.
- 비공개 게시글은 작성자 또는 ADMIN만 볼 수 있게 했다.
- `/me/posts`는 현재 로그인 사용자의 글을 조회하도록 정리했다.

검증:

- 비로그인 게시글 작성은 401이다.
- 권한 없는 수정/삭제는 403 또는 404로 처리된다.
- 작성자와 ADMIN은 수정/삭제할 수 있다.

## 2026-06-15 작업: 관리자 사용자 승인 API 연결

상태: 완료

진행한 것:

- `GET /admin/users` API를 구현했다.
- `PATCH /admin/users/{user_id}` API를 구현했다.
- 사용자 승인/역할 변경 이력을 `user_approval_logs`에 기록했다.
- 프론트 관리자 사용자 승인 화면을 실제 API 기반으로 연결했다.
- 최고관리자(`ADMIN_EMAILS`)는 role/status 변경이 불가능하도록 백엔드와 프론트에서 방어했다.

검증:

- ADMIN만 사용자 승인 API에 접근 가능하다.
- 학생/코치는 관리자 API 접근이 제한된다.
- 최고관리자 계정 변경 시도는 거부된다.

커밋 예시:

```txt
feat: 관리자 사용자 승인 API 연결
```

## 2026-06-15 작업: 포트폴리오 프로젝트 API 연결

상태: 완료

진행한 것:

- `GET /portfolio/projects`
- `POST /portfolio/projects`
- `PATCH /portfolio/projects/{project_id}`
- `PUT /portfolio/projects/{project_id}/posts`
- 포트폴리오 프로젝트와 내 기록 게시글 N:M 연결
- 포트폴리오 상태와 코치 피드백 상태 저장

프론트 연결:

- 포트폴리오 관리 화면을 API 기반으로 연결했다.
- GitHub 프로젝트 등록 UI를 실제 API 호출로 바꿨다.
- 기록 연결하기 UI를 API 기반으로 정리했다.

검증:

- 프로젝트 목록 조회 성공
- 프로젝트 등록 성공
- 프로젝트-게시글 연결 성공

## 2026-06-15 작업: 코치 리뷰 API 연결

상태: 완료

진행한 것:

- 학생 리뷰 요청 생성
- 학생의 내가 보낸 요청 조회
- 코치 인박스 조회
- 코치 피드백/상태 변경
- 대기 중 요청 취소
- 코치 피드백 전송 UI 정리

검증:

- 학생은 자신의 요청만 본다.
- 코치는 자신에게 온 요청을 본다.
- 코치는 피드백과 상태를 함께 전송한다.
- 피드백 완료 상태가 학생 요청 현황에 표시된다.

## 2026-06-15 작업: 알림 API 연결

상태: 완료

진행한 것:

- 알림 목록 API를 연결했다.
- 코치 리뷰 상태 변경 시 학생 알림이 생성되도록 연결했다.
- 헤더 알림 popover를 실제 API 기반으로 정리했다.

검증:

- 학생 계정에서 코치 리뷰 피드백 알림이 보인다.
- 읽음 처리 흐름을 확인했다.

## 2026-06-16 작업: GitHub REST API로 포트폴리오 분석 연결

상태: 완료

진행한 것:

- GitHub repo URL에서 owner/repo/branch를 파싱했다.
- GitHub REST API로 repository metadata, README, languages, commits를 조회했다.
- branch URL을 지원하도록 `github_branch`를 추가했다.
- 같은 repo라도 branch가 다르면 별도 프로젝트로 등록 가능하게 했다.
- `GitHub 정보 새로고침` API를 추가했다.

검증:

- public repo 등록 성공
- branch URL 등록 성공
- repo 링크와 branch 링크를 분리했다.

## 2026-06-16 작업: 프로젝트 기반 포트폴리오 게시글 발행

상태: 완료

진행한 것:

- 포트폴리오 프로젝트를 `포트폴리오 관리` 카테고리 게시글로 발행하는 API를 추가했다.
- 이미 발행된 프로젝트는 중복 게시글을 만들지 않고 기존 게시글을 갱신한다.
- 내용이 완전히 같으면 `unchanged`로 처리한다.
- 제목에서 `[포트폴리오]` prefix를 제거하고 `프로젝트명 포트폴리오` 형식으로 정리했다.
- 발행 시 공개/비공개를 선택하는 modal을 추가했다.

검증:

- 처음 발행: `created`
- 내용 변경 후 발행: `updated`
- 같은 내용 재발행: `unchanged`
- 중복 게시글 없음

## 2026-06-16 작업: 포트폴리오 UI 개선

상태: 완료

진행한 것:

- 포트폴리오 관리 화면 버튼 위치를 섹션별로 정리했다.
- GitHub README는 AI 참고 자료로 접힘/preview 형태로 표시했다.
- 포트폴리오 게시글 상세를 전용 UI로 렌더링했다.
- Markdown 기호가 그대로 보이지 않도록 포트폴리오 섹션 렌더링을 정리했다.
- toast와 confirm modal을 적용해 큰 notice block을 줄였다.

검증:

- 일반 게시글 상세 흐름 유지
- 포트폴리오 게시글은 전용 섹션 UI로 표시
- `npm run build` 성공

## 2026-06-16 작업: 로그인/관리자 UI 개선

상태: 완료

진행한 것:

- 로그인 화면을 중앙 단일 구조로 정리했다.
- Google 로그인 버튼을 더 명확하게 만들었다.
- 로그인 화면에서 승인 대기 설명 문구를 제거했다.
- 관리자 화면 통계에 `승인 완료 학생` 카드를 추가했다.
- 관리자 목록의 처리/담당 표시 문자를 보기 좋게 정리했다.

검증:

- 로그인 화면이 깨지지 않는다.
- Google 로그인 버튼은 기존 loginWithGoogle 흐름을 유지한다.
- 관리자 통계 카드가 4개로 보인다.

## 2026-06-16 작업: AI/RAG용 GitHub 참고 자료 저장 준비

상태: 완료

목표:

- AI가 나중에 README preview만 보는 것이 아니라 README 원문 전체와 수집된 커밋 메시지 전체를 참고할 수 있게 DB/API 구조를 준비했다.
- 포트폴리오 관리 화면에서는 요약만 유지하되, 전체 커밋 메시지는 모달/접힘 UI로 확인할 수 있게 했다.
- 포트폴리오 프로젝트 대상 코치 리뷰 상태가 프로젝트 카드에도 반영되도록 연결했다.

수정 파일:

- `backend/app/db/models/github_commit.py`
- `backend/app/db/models/portfolio_project.py`
- `backend/app/repositories/portfolio_repository.py`
- `backend/app/services/github_service.py`
- `backend/app/services/portfolio_service.py`
- `backend/app/services/review_service.py`
- `backend/app/schemas/portfolio.py`
- `frontend/src/app/api/portfolio.ts`
- `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `frontend/src/app/pages/ai/AIAssistant.tsx`
- `frontend/src/app/pages/posts/PostDetail.tsx`

변경 요약:

- `portfolio_projects.readme_content`를 추가해 README 원문 전체 저장을 준비했다.
- `github_commits` 테이블을 추가해 프로젝트별 commit message를 저장한다.
- GitHub commits API를 page 단위로 반복 호출해 수집 가능한 전체 커밋 메시지를 저장하도록 바꿨다.
- 화면에는 최근 일부만 보여주고, AI/RAG 단계에서는 전체 데이터를 참고한다는 문구를 추가했다.
- 포트폴리오 프로젝트 대상 리뷰 요청 생성/상태 변경 시 `coach_feedback_status`를 같이 갱신한다.

QA:

```txt
npm run build: success
backend compileall: success
service smoke: projects/readme/commits/review status success
```

커밋 추천 제목:

```txt
feat: AI용 GitHub 참고 자료 저장 구조 준비
```

## 2026-06-16 작업: 포트폴리오 상세 레이아웃 재배치

상태: 완료

진행한 것:

- 포트폴리오 관리 상세를 왼쪽 핵심 영역과 오른쪽 보조 영역으로 나눴다.
- 왼쪽에는 프로젝트 제목, repo/branch 링크, 주요 액션, 포트폴리오 상태, 포트폴리오 글을 배치했다.
- 오른쪽에는 면접 예상 질문, 코치 리뷰/피드백, GitHub 참고 정보, 연결된 학습 기록을 세로로 배치했다.
- 내 프로젝트 목록에 코치 리뷰 상태 필터를 추가했다.
- 관리자 화면의 깨진 `? 처리`, `? 담당` 표시를 `· 처리`, `· 담당`으로 수정했다.

검증:

```txt
npm run build: success
backend compileall: success
browser /portfolio: console error 없음
browser /admin/users: console error 없음
```

커밋 추천 제목:

```txt
style: 포트폴리오 상세 레이아웃과 관리자 표시 정리
```

## 다음 작업

AI 기능 전 마지막 확인:

1. 학생 계정에서 포트폴리오 등록/연결/발행/상태 필터를 수동 확인한다.
2. 코치 계정에서 리뷰 인박스와 피드백 전송을 확인한다.
3. 관리자 계정에서 승인/역할 변경과 최고관리자 보호를 확인한다.
4. AI 단계에서는 OpenAI/RAG/MCP/Agent 설계와 API를 시작한다.
