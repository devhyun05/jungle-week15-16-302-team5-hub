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

## 2026-06-16 포트폴리오 관리 UI 정리

- 작업 파일: `frontend/src/app/pages/portfolio/Portfolio.tsx`
- 내 프로젝트 목록의 코치 리뷰 상태 필터를 segmented control 형태로 변경했다.
- 오른쪽 보조 column의 GitHub 참고 정보를 세로 section으로 나누어 기술 스택, 커밋 참고, 최근 커밋 preview, README 참고가 섞이지 않게 정리했다.
- 데이터/API 구조는 변경하지 않고 기존 `coachStatusFilter`, `selectedProject.githubCommits`, `recentCommitSummary`, `readmeSummary` 값을 그대로 사용했다.

## 2026-06-16 포트폴리오 상세 3단 UI 조정

- 작업 파일: `frontend/src/app/pages/portfolio/Portfolio.tsx`
- 코치 리뷰 상태 필터를 select/dropdown UI로 변경했다.
- `요청함`은 백엔드/API 값으로 유지하고, 화면에서는 `요청 대기 중`으로 변환해 보여준다.
- 선택 프로젝트 상세를 3단 grid로 변경해 왼쪽은 포트폴리오 글, 가운데는 면접 질문/코치 리뷰/연결 기록, 오른쪽은 GitHub 참고 정보가 담당하도록 나눴다.
- GitHub 참고 정보는 별도 오른쪽 column으로 분리했기 때문에 긴 연결 기록이나 면접 질문과 시각적으로 섞이지 않는다.

## 2026-06-16 포트폴리오 보조 정보 column UI 정리

- 작업 파일: `frontend/src/app/pages/portfolio/Portfolio.tsx`
- 가운데 column의 section padding과 gap을 맞춰 면접 질문, 코치 리뷰, 연결 기록이 같은 리듬으로 보이게 정리했다.
- 연결된 학습 기록 카드는 왼쪽 emerald line과 내부 padding을 넣어 카테고리, 날짜, 제목, 요약이 한 묶음으로 읽히게 했다.

## 2026-06-16 포트폴리오 보조 카드 header 줄바꿈 정리

- 작업 파일: `frontend/src/app/pages/portfolio/Portfolio.tsx`
- 가운데 column의 카드 header에서 제목과 버튼을 분리했다.
- `코치 리뷰/피드백`, `연결된 학습 기록` 제목이 버튼 때문에 중간에서 잘리지 않도록 `whitespace-nowrap`과 header 구조를 조정했다.
- 상세 grid의 가운데 column 최소 폭을 320px로 키웠다.

## 2026-06-16 포트폴리오 GitHub 액션 버튼 순서 조정

- 작업 파일: `frontend/src/app/pages/portfolio/Portfolio.tsx`
- `GitHub 정보 새로고침` 버튼을 `GitHub 보기` 왼쪽으로 옮겼다.
- 버튼 기능은 그대로 두고 렌더링 순서만 변경했다.

## 2026-06-16 포트폴리오 액션 버튼 그룹 정렬

- 작업 파일: `frontend/src/app/pages/portfolio/Portfolio.tsx`
- 상단 액션 영역을 초록색 포트폴리오 작업 그룹과 흰색 GitHub 작업 그룹으로 나눴다.
- 흰색 버튼들이 서로 떨어져 줄바꿈되지 않도록 같은 wrapper 안에서 정렬했다.

## 2026-06-16 포트폴리오 액션 버튼 2줄 정렬

- 작업 파일: `frontend/src/app/pages/portfolio/Portfolio.tsx`
- 포트폴리오 액션과 GitHub 액션을 각각 한 줄씩 보이도록 정렬했다.
- 이전처럼 좌우로 벌어지는 구조를 제거하고 왼쪽 정렬된 2줄 구조로 단순화했다.

## 2026-06-16 OpenAI 기본 연결 1차 구현

- 작업 파일:
  - `backend/app/core/config.py`
  - `backend/app/schemas/ai.py`
  - `backend/app/services/ai_service.py`
  - `backend/app/routers/ai.py`
  - `backend/app/main.py`
  - `backend/.env.example`
  - `backend/requirements.txt`
- OpenAI Python SDK `openai==2.41.1`을 설치했다.
- `POST /ai/generate` API를 추가했다.
- 지금은 RAG가 아니라 선택 프로젝트 자료를 직접 prompt context로 넣는 구조다.
- `OPENAI_API_KEY`가 없으면 API는 400으로 `OPENAI_API_KEY가 설정되어 있지 않습니다.`를 반환한다.

## 2026-06-17 AI 도우미 프론트 API 연결

- 작업 파일:
  - `frontend/src/app/api/ai.ts`
  - `frontend/src/app/pages/ai/AIAssistant.tsx`
  - `README.md`
  - `docs/agent/study.md`
  - `docs/agent/log.md`
  - `docs/agent/test.md`
- AI 도우미 화면에 `OpenAI로 생성하기` 버튼을 추가했다.
- 버튼 클릭 시 백엔드 `POST /ai/generate`를 호출하고, 성공하면 생성 결과를 결과 영역에 표시한다.
- 프로젝트나 생성 유형을 바꾸면 이전 AI 생성 결과를 초기화해 다른 프로젝트 결과가 섞이지 않게 했다.
- 화면 진입 시 자동 호출하지 않아 OpenAI 비용이 불필요하게 발생하지 않도록 했다.
- 현재 확인 결과 `backend/.env`에는 `OPENAI_API_KEY` 변수명은 있지만 값 길이가 0이다. 실제 생성 QA 전에 키 값을 다시 넣어야 한다.

검증:

```txt
frontend npm run build: success
backend compileall app: success
backend app import: success
```

## 2026-06-17 OpenAI 실제 호출 QA

- `backend/.env`의 `OPENAI_API_KEY` 값이 들어간 것을 값 출력 없이 길이로만 확인했다.
- 기존 백엔드 서버가 AI 라우터 추가 전 코드로 떠 있어서 `/ai/generate`가 처음에는 404를 반환했다.
- 8000 포트의 기존 Python 서버 프로세스를 종료하고 `.venv` 기준으로 FastAPI 서버를 재시작했다.
- 재시작 후 `http://localhost:8000/openapi.json`에서 `/ai/generate` 라우트가 등록된 것을 확인했다.
- 테스트용 JWT access token cookie로 실제 `POST /ai/generate` HTTP endpoint를 호출했다.
- `project_id=25`, `output_type=interview` 요청이 `200 OK`로 성공했고, `gpt-4.1-mini` 모델 응답이 반환됐다.
- 브라우저의 현재 관리자 계정에는 포트폴리오 프로젝트가 없어 `/ai-assistant` 화면에서 실제 버튼 QA는 아직 못 했다. 현재 프로젝트는 `leejunhee2796@gmail.com` 계정 소유다.

검증 결과:

```txt
POST /ai/generate: 200 OK
model: gpt-4.1-mini
content_length: 2313
```

## 2026-06-17 GitHub 참고 자료 UI 정리

- 작업 파일:
  - `frontend/src/app/pages/portfolio/Portfolio.tsx`
  - `frontend/src/app/pages/posts/PostDetail.tsx`
  - `frontend/src/app/pages/ai/AIAssistant.tsx`
  - `README.md`
  - `docs/agent/study.md`
  - `docs/agent/log.md`
  - `docs/agent/test.md`
- 포트폴리오 관리 화면의 `수집된 커밋 n개 보기` 버튼을 제거했다.
- 전체 커밋 메시지 모달도 제거했다.
- 커밋 전체 목록은 화면에 직접 보여주지 않고, AI/RAG context로만 사용한다.
- 사용자가 전체 커밋을 보고 싶을 때는 GitHub의 commits 페이지로 이동하도록 `GitHub 커밋 보기`만 남겼다.
- GitHub 커밋 메시지 참고 자료와 README 참고 자료 설명을 제목 아래로 들여쓰기해 정리했다.
- 포트폴리오 게시글 상세에서도 `전체 커밋 메시지 보기` details 영역을 제거했다.

검증:

```txt
removed text search: no stale UI found
frontend npm run build: success
backend compileall app: success
```

## 2026-06-17 AI 생성 결과 저장 API 흐름 QA

- 현재 브라우저 로그인 계정은 관리자이고, 포트폴리오 프로젝트는 `leejunhee2796@gmail.com` 학생 계정 소유라 UI 버튼 직접 QA는 계정 전환이 필요했다.
- 먼저 학생 계정 JWT cookie를 만들어 프론트가 호출하는 것과 같은 API 흐름을 검증했다.
- 검증 흐름:
  1. `GET /portfolio/projects`
  2. `POST /ai/generate`
  3. `PATCH /portfolio/projects/{id}`
  4. `GET /portfolio/projects`
- `project_id=25` 기준 면접 예상 질문 생성과 저장이 성공했다.

검증 결과:

```txt
projects_status=200
generate_status=200
model=gpt-4.1-mini
content_length=2203
save_status=200
aiInterviewSaved=True
verify_status=200
savedInterviewLength=2203
frontend npm run build: success
backend compileall app: success
```

## 2026-06-17 포트폴리오 게시글 본문 파싱 수정

- 작업 파일:
  - `frontend/src/app/pages/posts/PostDetail.tsx`
  - `frontend/src/app/pages/portfolio/Portfolio.tsx`
  - `README.md`
  - `docs/agent/study.md`
  - `docs/agent/log.md`
  - `docs/agent/test.md`
- 문제:
  - 포트폴리오 게시글 발행 후 상세에서 `아직 작성된 포트폴리오 글이 없습니다.`가 보일 수 있었다.
  - DB의 발행 게시글에는 실제 포트폴리오 글이 들어 있었지만, 프론트 파서가 `## 포트폴리오 글` 아래 AI 생성 본문의 `#`, `##` 제목을 새 섹션으로 오해했다.
- 해결:
  - `parsePortfolioPostContent`에서 현재 섹션이 `포트폴리오 글`이면 이후 줄의 Markdown heading을 새 섹션으로 해석하지 않고 본문으로 유지했다.
  - 포트폴리오 관리 화면의 긴 저장 글은 12줄 preview로 보여주고 `전체 포트폴리오 글 보기` 모달에서 전체 내용을 볼 수 있게 했다.

검증:

```txt
frontend npm run build: success
backend compileall app: success
post 62 portfolio_section_length: 2122
browser /posts/62 hasPlaceholder: false
browser /posts/62 hasPortfolioTitle: true
```

## 2026-06-17 포트폴리오 Markdown 렌더링 개선

- 작업 파일:
  - `frontend/src/app/components/portfolio/PortfolioMarkdownBlock.tsx`
  - `frontend/src/app/pages/posts/PostDetail.tsx`
  - `frontend/src/app/pages/portfolio/Portfolio.tsx`
  - `README.md`
  - `docs/agent/study.md`
  - `docs/agent/log.md`
  - `docs/agent/test.md`
- `PortfolioMarkdownBlock` 공용 컴포넌트를 추가했다.
- `#`, `##`, `###`, `-`, `---`를 포트폴리오 전용 UI 구조로 렌더링한다.
- 기존처럼 Markdown 기호를 단순히 제거하지 않고, 제목/섹션/목록/구분선 의미를 살렸다.
- 포트폴리오 게시글 상세와 포트폴리오 관리의 전체 글 보기 모달이 같은 렌더러를 재사용한다.
- 외부 Markdown 라이브러리는 추가하지 않았다.

검증:

```txt
frontend npm run build: success
backend compileall app: success
browser /posts/62 hasHashHeadingMarker: false
browser /posts/62 hasDividerMarker: false
browser /posts/62 hasPortfolioTitle: true
browser /posts/62 hasRoleSection: true
browser /posts/62 hasTroubleSection: true
```

### 추가 보정

- AI 결과가 `### ai-board-lab 프로젝트 소개 및 문제 정의`처럼 낮은 heading으로 시작하면 첫 heading을 대표 제목 카드로 승격하도록 보정했다.
- Markdown heading 없이 첫 줄이 제목처럼 오고 다음 줄부터 본문이 이어지는 경우에도 첫 줄을 대표 제목 카드로 승격한다.
- 포트폴리오 관리 화면의 preview 영역도 raw text가 아니라 `PortfolioMarkdownBlock`의 compact 모드를 사용하도록 변경했다.

## 2026-06-17 포트폴리오 문서형 상세 UI 보강

- 작업 파일:
  - `frontend/src/app/components/portfolio/PortfolioMarkdownBlock.tsx`
  - `frontend/src/app/pages/portfolio/Portfolio.tsx`
  - `frontend/src/app/pages/posts/PostDetail.tsx`
  - `backend/app/services/portfolio_service.py`
  - `README.md`
  - `docs/agent/study.md`
  - `docs/agent/log.md`
  - `docs/agent/test.md`
- 문제:
  - AI 결과가 `#### 문제 정의`처럼 4단계 heading으로 오면 Markdown 기호가 그대로 보였다.
  - 포트폴리오 관리 화면의 면접 예상 질문/코치 피드백 preview는 포트폴리오 글보다 덜 정돈되어 보였다.
  - 포트폴리오 게시글 상세에서 포트폴리오 글이 너무 아래에 있고, 본문 공간이 좁아 보였다.
  - 발행된 포트폴리오 게시글에 저장된 면접 예상 질문이 포함되지 않았다.
- 해결:
  - Markdown 렌더러가 `#`부터 `######`까지 처리하도록 확장했다.
  - numbered list도 목록으로 렌더링하도록 보강했다.
  - 면접 예상 질문과 코치 피드백 preview/전체보기 모달에 같은 렌더러를 적용했다.
  - 포트폴리오 게시글 발행 본문에 `## 면접 예상 질문` 섹션을 추가했다.
  - 포트폴리오 게시글 상세를 넓은 문서형 레이아웃으로 바꾸고, 포트폴리오 글을 프로젝트 개요 바로 아래 메인 영역으로 올렸다.

검증:

```txt
frontend npm run build: success
backend compileall app: success
```

## 2026-06-17 포트폴리오 프로젝트 삭제와 면접 질문 preview 정리

- 작업 파일:
  - `backend/app/repositories/portfolio_repository.py`
  - `backend/app/services/portfolio_service.py`
  - `backend/app/routers/portfolio.py`
  - `frontend/src/app/api/portfolio.ts`
  - `frontend/src/app/pages/portfolio/Portfolio.tsx`
  - `frontend/src/app/pages/posts/PostDetail.tsx`
  - `frontend/src/app/utils/interviewQuestions.ts`
  - `README.md`
  - `docs/agent/study.md`
  - `docs/agent/log.md`
  - `docs/agent/test.md`
- 문제:
  - GitHub 프로젝트 등록 기능은 있는데 삭제 기능이 없어 잘못 등록한 프로젝트를 정리할 수 없었다.
  - 면접 예상 질문 preview가 답변 포인트까지 길게 보여 카드 안에서 난잡해 보였다.
  - 포트폴리오 게시글 상세의 면접 예상 질문 버튼 위치가 코치 피드백 아래에 있어 정보 우선순위가 어색했다.
- 해결:
  - `DELETE /portfolio/projects/{project_id}` API를 추가했다.
  - 프로젝트 삭제 시 프로젝트-게시글 연결, GitHub commit 수집 데이터, 프로젝트 대상 리뷰 요청과 리뷰 요청 코치 연결을 함께 삭제한다.
  - 발행된 포트폴리오 게시글은 게시판 기록으로 남긴다.
- 포트폴리오 관리 화면에 삭제 버튼과 확인 modal을 추가했다.
- 면접 질문 preview는 질문 3개만 요약해서 보여주도록 정리했다.
- 포트폴리오 게시글 상세에서 면접 질문 버튼을 오른쪽 보조 영역의 최근 커밋 요약 아래로 이동했다.

### 추가 보정

- 프로젝트 삭제 버튼을 상세 액션 영역에서 제거하고, 내 프로젝트 카드 오른쪽 `X` 버튼으로 이동했다.
- `X` 버튼은 카드 선택 click과 충돌하지 않도록 `event.stopPropagation()`을 사용한다.
- 삭제 실패 가능성이 있던 `db.delete(project)`를 `delete(PortfolioProject).where(...)` bulk delete로 바꿨다.
- 면접 예상 질문 전체보기는 `PortfolioMarkdownBlock` 대신 `InterviewQuestionsBlock` 전용 컴포넌트를 사용한다.
- 질문은 굵게, 답변은 `POINT` 영역으로 묶어 질문 하나와 답변 포인트가 같은 덩어리로 읽히게 했다.
- 한글 정규식이 깨져 `질문:`과 `답변 포인트:`를 제대로 인식하지 못하던 문제를 줄이기 위해 parser의 핵심 label 정규식을 유니코드 escape 기반으로 바꿨다.
- preview와 modal이 같은 `parseInterviewQuestionGroups` 기준을 사용하도록 정리했다.

검증:

```txt
frontend npm run build: success
backend compileall app: success
from app.main import app: success
```

## 2026-06-17 AI 도우미 저장값/면접 질문 표시 흐름 정리

- 작업 파일:
  - `frontend/src/app/pages/ai/AIAssistant.tsx`
  - `frontend/src/app/pages/portfolio/Portfolio.tsx`
  - `frontend/src/app/pages/posts/PostDetail.tsx`
  - `frontend/src/app/utils/interviewQuestions.ts`
  - `backend/app/services/ai_service.py`
  - `README.md`
  - `docs/agent/study.md`
  - `docs/agent/log.md`
  - `docs/agent/test.md`
- 문제:
  - AI 도우미에서 저장된 결과가 없어도 sample 포트폴리오 글/면접 질문이 실제 결과처럼 보였다.
  - 면접 예상 질문이 포트폴리오 게시글 상세에 바로 펼쳐져 글이 너무 길어졌다.
  - 면접 질문 생성 prompt가 꼬리 질문까지 요구해 화면이 더 복잡해졌다.
  - 포트폴리오 관리의 코치 리뷰/피드백 카드에서 전체 피드백 확인 진입점이 눈에 잘 보이지 않았다.
- 해결:
  - AI 도우미 결과 영역은 생성 결과 또는 저장된 결과가 있을 때만 본문을 보여주도록 바꿨다.
  - 저장된 결과가 없으면 `OpenAI로 생성하기`를 눌러야 결과가 표시된다는 안내만 보여준다.
  - 면접 질문 prompt에서 꼬리 질문 요구를 제거했다.
  - 기존 저장 데이터에 `꼬리 질문`이 있어도 화면에서는 제거하는 공통 util을 추가했다.
  - 포트폴리오 게시글 상세의 면접 예상 질문은 버튼을 눌러 modal에서 확인하도록 바꿨다.
  - 포트폴리오 관리의 코치 피드백 전체보기 버튼은 항상 보이게 했다.

검증:

```txt
frontend npm run build: success
backend compileall app: success
```

## 2026-06-17 RAG/MCP/Agent 최소 기능 연결

- 작업 파일:
  - `backend/app/db/models/rag_document.py`
  - `backend/app/repositories/rag_repository.py`
  - `backend/app/services/rag_service.py`
  - `backend/app/schemas/rag.py`
  - `backend/app/routers/rag.py`
  - `backend/app/schemas/mcp.py`
  - `backend/app/services/mcp_service.py`
  - `backend/app/routers/mcp.py`
  - `backend/app/schemas/agent.py`
  - `backend/app/services/agent_service.py`
  - `backend/app/routers/agent.py`
  - `backend/app/services/ai_service.py`
  - `frontend/src/app/api/ai.ts`
  - `frontend/src/app/pages/ai/AIAssistant.tsx`
  - `README.md`
  - `docs/agent/rag.md`
  - `docs/agent/mcp.md`
  - `docs/agent/ai-agent.md`
- 구현:
  - RAG 문서 저장 테이블 `rag_documents`를 추가했다.
  - `/ai/rag/index`, `/ai/rag/search` API를 추가했다.
  - `/mcp` JSON-RPC endpoint와 `get_github_repository`, `get_portfolio_project` tool을 추가했다.
  - `/ai/agent/run` API를 추가해 `get_portfolio_project -> rag_search -> generate_project_content` tool loop를 구성했다.
  - AI 도우미 화면에 `일반 생성`, `RAG 기반 생성`, `Agent 기반 생성` 선택 UI를 추가했다.
- 안전 기준:
  - OpenAI generation/embedding은 비용이 발생하므로 자동 QA에서는 실제 호출하지 않았다.
  - 실제 AI 호출 QA는 사용자의 명시적 허락 후 진행한다.
- 검증:

```txt
frontend npm run build: success
backend compileall app: success
from app.main import app: success
registered routes: /ai/generate, /ai/rag/index, /ai/rag/search, /mcp, /ai/agent/run
```
