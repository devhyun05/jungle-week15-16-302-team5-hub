# JungleLog

JungleLog는 크래프톤 정글 수강생이 학습 기록, 트러블슈팅, 프로젝트 회고, 면접 질문, 포트폴리오 자료를 관리하고 코치가 기록을 보고 피드백할 수 있는 AI 게시판 프로젝트입니다.

현재 목표는 **AI 기능 연결 직전까지 실제 웹서비스처럼 동작하는 상태**를 만드는 것입니다. OpenAI/RAG/MCP/Agent 호출은 다음 단계로 남겨두고, 인증/권한/게시판/포트폴리오/GitHub repo 분석/코치 리뷰 흐름은 실제 FastAPI API 기준으로 연결했습니다.

## 프로젝트 개요

- 프로젝트명: JungleLog
- 목적: 정글 수강생의 학습 기록과 포트폴리오 관리, 코치 피드백 흐름을 한 서비스 안에 연결
- 주요 사용자: 학생, 코치, 관리자
- 프론트엔드: React, TypeScript, Vite
- 백엔드: FastAPI, SQLAlchemy
- 데이터베이스: PostgreSQL
- 인증: Google OAuth 2.0, JWT access token, refresh token rotation, HttpOnly cookie
- 외부 연동: GitHub REST API
- AI 모델 예정: OpenAI API

## 현재 구현 상태

### 완료

- Google OAuth/JWT 인증 API
- access token / refresh token HttpOnly cookie 처리
- 공통 `apiFetch`로 access token 만료 시 refresh 후 서비스 API 1회 재시도
- 인증/서비스 API 조회 요청의 브라우저 캐시 방지 처리
- refresh token hash DB 저장, 재발급, 로그아웃 폐기
- `/auth/me` 기반 현재 사용자 조회
- 최초 로그인 사용자 `승인 대기` 처리
- `ADMIN_EMAILS` 기반 초기 관리자 자동 승인
- 기존 이메일 사용자와 Google OAuth sub 연결 처리
- 관리자 사용자 승인/역할 변경 API
- STUDENT / COACH / ADMIN 역할별 라우트 보호
- 승인 대기/거절/정지 사용자 서비스 접근 제한
- DB 초기화 시 개발용 demo 사용자를 자동 생성하지 않도록 정리
- 게시글 CRUD API와 화면 연결
- 댓글 조회/작성/삭제 API와 화면 연결
- 내 기록 조회 API와 화면 연결
- 프로필 이름/이미지 수정 API와 설정 화면 연결
- 포트폴리오 프로젝트 등록/수정/목록 API와 화면 연결
- GitHub REST API 기반 repo/branch 등록, README 요약, 사용 언어, 최근 커밋 조회 연결
- 등록된 프로젝트의 GitHub 정보 새로고침 API와 화면 연결
- 포트폴리오 프로젝트와 게시글 연결 API
- 포트폴리오 프로젝트 기반 `포트폴리오 관리` 게시글 발행/갱신 API
- 포트폴리오 프로젝트 중복 등록 방지와 GitHub 링크 이동 UI
- 포트폴리오 프로젝트 등록 후 목록 재조회/중복 등록 UX/긴 repo 카드 표시 안정화
- 코치 리뷰 요청 생성/취소/목록/인박스/피드백 API와 화면 연결
- 코치 리뷰 인박스에서 게시글/포트폴리오 리뷰 대상 미리보기 제공
- 알림 조회/읽음 처리 API와 헤더 알림 드롭다운 연결
- 관리자 승인, 리뷰 요청, 리뷰 피드백 이벤트 알림 생성
- 게시글 상세 조회 시 조회수 증가 처리
- 대시보드 주요 통계 API 기반 정리
- AI 도우미 화면을 포트폴리오 API 데이터 기반 샘플로 정리
- AI 도우미 화면을 프로젝트 선택, 참고 자료, 생성 결과 중심으로 재정리
- AI 도우미 화면에 포트폴리오 글/면접 질문 저장 상태 UI 추가
- 포트폴리오/AI 도우미의 내 기록 조회를 `/me/posts` API 계약(`size <= 50`)에 맞게 정리
- 레거시 `mockData.ts` 제거
- 브라우저 타이틀/메타 정보를 JungleLog 기준으로 정리
- 학생 주요 화면의 개발용/debug 문구를 서비스 문구로 정리
- 공통 API 에러 메시지 처리 보강으로 raw object 노출 방지
- 학생 주요 화면 브라우저 스모크 QA와 빈 상태/계정/설정 문구 정리
- 게시글 상세에서 자동 생성 요약과 본문이 중복 노출되지 않도록 정리

### 아직 다음 단계

- 실제 OpenAI API 호출
- RAG vector search와 요약 생성
- MCP server 구현
- GitHub 연동을 MCP tool 형태로 감싸는 구조
- Agent 추론 루프 구현
- 실시간 알림
- 실제 Google 계정 선택/동의 화면 수동 QA

## 주요 사용자 흐름

### 학생

1. Google 계정으로 로그인한다.
2. 최초 로그인 시 `승인 대기` 상태가 된다.
3. 관리자가 학생으로 승인하면 서비스 화면에 접근한다.
4. 학습 로그, 트러블슈팅, 프로젝트 회고, 면접 질문, 포트폴리오 관리 글을 작성한다.
5. GitHub repo 또는 `/tree/{branch}` URL로 포트폴리오 프로젝트를 등록하고 README, 사용 언어, 최근 커밋을 가져온다.
6. 프로젝트와 자신의 기록을 연결한다.
7. AI 도우미에서 포트폴리오 글/면접 예상 질문 샘플을 생성한다.
8. 게시글 또는 포트폴리오 프로젝트를 선택해 코치 리뷰를 요청한다.

### 코치

1. Google 계정으로 로그인한다.
2. 관리자가 코치로 승인하면 코치 화면에 접근한다.
3. 전체 게시글을 확인한다.
4. 자신에게 들어온 리뷰 요청을 인박스에서 확인한다.
5. 요청 상세를 보고 피드백과 상태를 저장한다.

### 관리자

1. `.env`의 `ADMIN_EMAILS`에 등록된 Google 계정으로 로그인한다.
2. 신규 사용자 목록을 확인한다.
3. 사용자를 STUDENT / COACH / ADMIN으로 지정한다.
4. 승인 대기 / 승인 완료 / 거절 / 정지 상태를 관리한다.

## 전체 아키텍처

```txt
Browser
  |
  | React + TypeScript + Vite
  | - AuthContext
  | - React Router RoleGate
  | - API client apiFetch(credentials: "include", refresh retry)
  v
FastAPI
  |
  | Routers
  | - auth
  | - posts / comments / me
  | - admin
  | - portfolio
  | - review-requests
  v
Service Layer
  |
  | 비즈니스 규칙
  | - 승인 상태 확인
  | - 역할별 권한 확인
  | - 게시글/댓글/리뷰 상태 검증
  | - GitHub REST API 조회 결과 정리
  | - branch 기준 README/commit/tree 정보 정리
  v
Repository Layer
  |
  | SQLAlchemy ORM
  v
PostgreSQL

External API
  |
  | GitHub REST API
  | - Repository metadata
  | - Branch README
  | - Branch tree based tech stack
  | - Branch recent commits
```

## 폴더 구조

```txt
WEEK15_AI_BOARD/
  frontend/
    src/app/
      api/
      components/
      constants/
      contexts/
      layouts/
      pages/
      routes.tsx
  backend/
    app/
      core/
      db/
      dependencies/
      repositories/
      routers/
      schemas/
      services/
      main.py
  docs/
    agent/
      code.md
      setup.md
      study.md
      log.md
      test.md
      troubleshooting.md
      db-design.md
      api-design.md
  docker-compose.yml
  README.md
```

## 주요 라우트

| Route | 화면 | 접근 |
| --- | --- | --- |
| `/login` | Google 로그인 | 비로그인 |
| `/pending-approval` | 승인 대기/거절/정지 안내 | 로그인 사용자 |
| `/` | 대시보드 | STUDENT, COACH, ADMIN |
| `/posts` | 전체 게시글 | STUDENT, COACH, ADMIN |
| `/posts/new` | 게시글 작성 | STUDENT, ADMIN |
| `/posts/:id` | 게시글 상세 | STUDENT, COACH, ADMIN |
| `/posts/:id/edit` | 게시글 수정 | 작성자, ADMIN |
| `/my-records` | 내 기록 | STUDENT, ADMIN |
| `/portfolio` | 포트폴리오 관리 | STUDENT, ADMIN |
| `/ai-assistant` | AI 도우미 | STUDENT, ADMIN |
| `/coach-review` | 학생 리뷰 요청 / 코치 인박스 | STUDENT, COACH, ADMIN |
| `/admin/users` | 사용자 승인 관리 | ADMIN |
| `/settings` | 설정 | STUDENT, COACH, ADMIN |

## 주요 API

### 인증

- `GET /auth/google/login`
- `GET /auth/google/callback`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

### 게시글/댓글

- `GET /posts`
- `POST /posts`
- `GET /posts/{post_id}`
- `PATCH /posts/{post_id}`
- `DELETE /posts/{post_id}`
- `GET /me/posts`
- `GET /posts/{post_id}/comments`
- `POST /posts/{post_id}/comments`
- `DELETE /comments/{comment_id}`

### 관리자

- `GET /admin/users`
- `PATCH /admin/users/{user_id}`

### 포트폴리오

- `GET /portfolio/projects`
- `POST /portfolio/projects`
- `PATCH /portfolio/projects/{project_id}`
- `POST /portfolio/projects/{project_id}/github/refresh`
- `PUT /portfolio/projects/{project_id}/posts`
- `POST /portfolio/projects/{project_id}/publish-post`

### 코치 리뷰

- `GET /review-requests/coaches`
- `POST /review-requests`
- `GET /review-requests/me`
- `GET /review-requests/inbox`
- `PATCH /review-requests/{review_request_id}`
- `DELETE /review-requests/{review_request_id}`

## AI 기능 설계

현재 AI 도우미는 아직 실제 OpenAI 호출 전입니다. 화면은 실제 포트폴리오/게시글 API 데이터를 기반으로 동작하며, 생성 결과는 **AI 연결 전 샘플**로 표시합니다.

### RAG 예정 기능

- 데이터 소스: JungleLog 게시글, 댓글, 포트폴리오 프로젝트, GitHub REST API로 가져온 branch별 README/커밋 요약
- 검색 대상: 학생이 작성한 학습 로그, 트러블슈팅, 회고, 면접 질문, 포트폴리오 관리 글
- 예정 Vector DB: PostgreSQL pgvector 또는 ChromaDB
- 예정 기능:
  - 포트폴리오 프로젝트와 연결된 기록 검색
  - 비슷한 게시글 추천
  - 포트폴리오 글 작성 시 근거 기록 요약
  - 면접 예상 질문 생성 시 프로젝트/기록 기반 근거 제공

### MCP 예정 기능

- MCP server를 통해 외부 시스템을 호출할 예정입니다.
- 기본 GitHub REST API 연동은 이미 FastAPI service로 구현했고, 다음 단계에서는 이를 MCP tool 형태로 분리/호출하는 구조를 검토합니다.
- 예정 기능:
  - GitHub repo URL 분석
  - README 가져오기
  - 최근 커밋 요약 가져오기
  - 포트폴리오 프로젝트 데이터 자동 보강

### Agent 예정 기능

- OpenAI function calling 또는 유사 tool calling 구조를 사용합니다.
- Agent는 아래 도구 중 필요한 작업을 선택하는 구조로 설계할 예정입니다.
  - 게시글 검색
  - 포트폴리오 프로젝트 조회
  - GitHub 정보 조회
  - 포트폴리오 초안 생성
  - 면접 예상 질문 생성
- 무한 루프 방지를 위해 최대 반복 횟수와 예외 처리 정책을 둡니다.

## 실행 방법

### 1. PostgreSQL 실행

```powershell
docker compose up -d
```

### 2. 백엔드 실행

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Swagger UI:

```txt
http://localhost:8000/docs
```

### 3. 프론트엔드 실행

```powershell
cd frontend
npm install
npm run dev
```

프론트엔드:

```txt
http://localhost:5173
```

## 환경 변수

실제 비밀값은 `backend/.env`에 저장하고 커밋하지 않습니다. 예시는 `backend/.env.example`을 참고합니다.
프론트엔드 API 주소 예시는 `frontend/.env.example`을 참고합니다.

필수 설정:

```txt
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
JWT_SECRET_KEY=
ADMIN_EMAILS=
DATABASE_URL=postgresql+psycopg://junglelog:junglelog@localhost:5432/junglelog
FRONTEND_URL=http://localhost:5173
BACKEND_CORS_ORIGINS=http://localhost:5173
GITHUB_TOKEN= # 선택. public repo만 조회할 때는 비워도 됨
```

프론트엔드 설정:

```txt
VITE_API_BASE_URL=http://localhost:8000
```

`VITE_API_BASE_URL`이 없으면 프론트엔드는 기본값으로 `http://localhost:8000`을 사용합니다.

Google Cloud Console 설정:

- 승인된 JavaScript 원본: `http://localhost:5173`
- 승인된 리디렉션 URI: `http://localhost:8000/auth/google/callback`
- 테스트 모드라면 OAuth 동의 화면 테스트 사용자에 실제 Gmail 추가

## QA 결과

최근 검증:

- `npm run build` 성공
- `python -m compileall app` 성공
- public GitHub repo smoke test 성공: `octocat/Hello-World`의 README/최근 커밋 조회 확인
- `git diff --check` 통과
- 학생 화면 QA 개선 1차 검증
- Swagger/OpenAPI 주요 API 등록 확인
- Google OAuth/JWT callback 흐름 TestClient 검증
- 비밀값 출력 없이 OAuth/JWT 환경변수 설정 여부 확인
- `/auth/google/login`이 Google OAuth URL과 state cookie를 생성하는지 확인
- 관리자/학생/코치 실제 API 시나리오 검증
- 비로그인 브라우저 진입 시 `/login` 이동 확인
- 비로그인 사용자의 `/posts/new` 직접 접근 시 `/login` 이동 확인
- 브라우저 탭 제목과 HTML 메타 정보가 JungleLog 기준인지 확인
- 로그인 화면의 Google 로그인 버튼이 실제 Google OAuth 화면으로 이동하는지 확인
- 로컬 DB의 과거 개발용 demo 사용자 잔존 데이터 제거 확인

통합 시나리오에서 검증한 흐름:

- ADMIN 최초 로그인과 승인 완료 처리
- 신규 STUDENT 승인 대기 처리
- 승인 전 보호 API 접근 차단
- ADMIN의 학생/코치 승인과 역할 변경
- 승인된 STUDENT의 게시글 작성, 내 기록 조회, 댓글 작성
- 승인된 STUDENT의 포트폴리오 프로젝트 등록, 게시글 연결, 초안 저장
- 승인된 STUDENT의 코치 리뷰 요청 생성
- 승인된 COACH의 리뷰 인박스 조회, 피드백 작성, 상태 변경
- 피드백 완료 이후 학생의 리뷰 요청 취소 차단
- 리뷰 요청 생성, 코치 인박스 조회, 피드백 저장, 학생 알림 생성 왕복 흐름 검증
- 실제 STUDENT 브라우저 화면에서 글쓰기 -> 게시글 상세 -> 코치 리뷰 요청 대상 표시 -> 리뷰 요청 전송 흐름 검증
- 코치 리뷰 요청 대상 조회 시 `/me/posts` API의 `size <= 50` 계약에 맞게 프론트 호출값 수정
- 실제 COACH 브라우저 화면에서 리뷰 인박스 표시, 상태 변경, 저장된 피드백 재표시 흐름 검증
- COACH 기본 진입 화면과 사이드바를 코치 리뷰 인박스 중심으로 정리
- 실제 STUDENT 브라우저 화면에서 코치 피드백 완료 상태, 피드백 본문, 리뷰 피드백 알림, 알림 읽음 처리 흐름 검증
- 포트폴리오/AI 도우미에서 `/me/posts` 조회 크기 오류 수정 후 프로젝트 연결, AI 도우미 이동, 초안 저장 흐름 검증
- 포트폴리오 프로젝트 등록 후 목록 유지, 대소문자 다른 같은 repo 중복 차단, GitHub 보기 링크, 긴 repo 카드 overflow 없음 검증
- 게시글 목록/상세의 조회수 증가와 댓글 수 반영 흐름을 실제 API 기준으로 검증
- 게시글 작성 직후 코치 리뷰 요청 대상 목록과 요청 전송 흐름을 실제 API/브라우저 기준으로 검증
- 학생 화면의 `API`, `샘플`, `MCP/RAG 연결 후` 같은 개발용 문구 노출 여부 점검 및 정리
- 공통 `getErrorMessage()` 보강으로 `[object Object]` 노출 위험 점검
- 학생 주요 라우트 8개에서 debug/기술 문구와 빈 상태 문구 점검
- 학생 글쓰기 브라우저 QA 중 발견한 상세 화면 요약/본문 중복 표시 수정
- 코치 리뷰 인박스 피드백 상태 반영, 학생 알림 생성, 관리자 role 복구 흐름 검증
- 오래 떠 있던 Vite dev 서버와 브라우저 캐시로 role/menu가 낡게 보이는 문제를 공통 `apiFetch`와 `cache: "no-store"`로 정리

남은 수동 QA:

- 실제 브라우저에서 Google 계정 선택과 OAuth 동의 화면 통과
- 실제 관리자 계정으로 신규 사용자 승인 후 프론트 화면 분기 확인
- 브라우저 자동화 입력 제한이 풀리면 코치 피드백 textarea 직접 입력까지 E2E 재검증
- 브라우저 자동화 입력 제한이 풀리면 포트폴리오 repo URL 입력/중복 등록 UX를 실제 클릭으로 재검증

## 데모

현재 로컬 브라우저 QA 기준으로 로그인 화면, 보호 라우트 redirect, Swagger API 등록을 확인했습니다.

제출 전 추가하면 좋은 스크린샷:

- Google 로그인 화면
- 승인 대기 화면
- 관리자 사용자 승인 화면
- 학생 대시보드
- 포트폴리오 관리 화면
- 코치 리뷰 인박스

## 회고와 한계

### 배운 점

- React 화면 mock 단계와 실제 API 연결 단계는 설계 기준이 다르다.
- 로그인 상태와 승인 상태는 분리해서 생각해야 한다.
- 프론트 라우트 보호는 UX를 위한 것이고, 실제 보안은 백엔드 권한 검사가 담당해야 한다.
- refresh token은 원문을 DB에 저장하지 않고 hash로 저장하는 편이 안전하다.
- access token이 짧게 만료되는 구조에서는 일반 API 호출도 refresh 재시도 흐름을 공유해야 한다.
- 학생/코치/관리자 role이 생기면 단순 CRUD보다 권한 검증이 훨씬 중요해진다.

### 현재 한계

- 실제 Google 계정 선택 후 callback 수동 QA가 아직 남아 있다.
- 알림은 현재 API 기반 조회/읽음 처리까지 지원하며, 실시간 push는 아직 없다.
- GitHub repo 분석은 기본 REST API로 연결됐고, MCP tool 구조는 아직 남아 있다.
- AI 도우미는 아직 OpenAI/RAG/MCP/Agent를 호출하지 않는다.
- AI 도우미 화면은 프로젝트 기반 생성 결과 보관함과 클립보드 복사 흐름까지 UI 기준으로 정리했다.
- 프로필 이름 수정과 이미지 업로드는 API 기준으로 검증했고, 업로드 이미지 URL이 게시글/댓글/리뷰 요청 응답까지 이어진다.
- 학생 게시글 작성/상세/댓글/수정/삭제/내 기록 반영 흐름을 브라우저에서 확인했고, 댓글 시간은 한국식 날짜/시간으로 표시한다.

### 개선 아이디어

- pgvector 기반 RAG 검색 추가
- GitHub MCP server 구현
- OpenAI function calling 기반 Agent 구현
- WebSocket 또는 SSE 기반 실시간 알림 추가
- 테스트 자동화 파일 분리
- Playwright 기반 프론트 E2E 테스트 추가

## 학습/운영 문서

- [코드 컨벤션](docs/agent/code.md)
- [세팅 기록](docs/agent/setup.md)
- [학습 기록](docs/agent/study.md)
- [진행 로그](docs/agent/log.md)
- [QA 체크리스트](docs/agent/test.md)
- [트러블슈팅](docs/agent/troubleshooting.md)
- [DB 설계](docs/agent/db-design.md)
- [API 설계](docs/agent/api-design.md)

### OAuth 실패 UX

OAuth callback 실패 시 백엔드 JSON 에러 화면을 직접 보여주지 않고 `/login?authError=...`로 돌아가도록 처리했습니다.

- callback 값 부족, state 불일치, Google token/profile 처리 실패 시 로그인 화면으로 redirect
- 로그인 화면에서 실패 안내와 `Google로 계속하기` 버튼 표시
- 실패 시 OAuth state cookie 삭제

### 관리자 메뉴 정리

관리자 화면은 사용자 승인 관리가 중심이므로 사이드바에서 대시보드 메뉴를 제거했습니다.

- ADMIN 기본 진입 화면: `/admin/users`
- ADMIN 메뉴: 사용자 승인, 전체 게시글, 설정
- `/`에 직접 접근하면 관리자 사용자는 사용자 승인 화면으로 이동합니다.

### 코치 메뉴 정리

코치 화면은 학생 기록 작성보다 리뷰 요청 처리가 중심이므로 사이드바에서 대시보드 메뉴를 제거했습니다.

- COACH 기본 진입 화면: `/coach-review`
- COACH 메뉴: 코치 리뷰 인박스, 전체 게시글, 설정
- `/`에 직접 접근하면 코치 사용자는 코치 리뷰 인박스로 이동합니다.

## 최근 변경: AI 도우미 결과 보관

- AI 도우미에서 만든 면접 예상 질문을 포트폴리오 프로젝트에 저장할 수 있도록 `savedInterviewQuestions` 흐름을 추가했습니다.
- 포트폴리오 프로젝트 응답에 `aiInterviewSaved`를 추가해 저장 여부를 화면 badge로 보여줍니다.
- 현재 생성은 OpenAI 연결 전 샘플 결과이며, 저장/조회 흐름은 실제 포트폴리오 API와 DB 기준으로 동작합니다.
- 백엔드 로컬 개발 DB는 Alembic 도입 전 단계이므로 `ADD COLUMN IF NOT EXISTS`로 새 nullable column을 보강합니다.

## 최근 변경: 포트폴리오 빈 상태 문구 정리

- 새 GitHub 프로젝트 등록 시 README/최근 커밋/포트폴리오 초안 안내 문구를 DB에 저장하지 않고 빈 값으로 둡니다.
- 포트폴리오 관리와 AI 도우미 화면은 빈 값일 때 사용자용 empty state 문구를 직접 보여줍니다.
- 과거 개발 단계에서 저장된 안내 문구는 포트폴리오 API 응답에서 빈 값처럼 정리해 화면에 노출되지 않게 했습니다.

## 최근 변경: 코치 리뷰 인박스 QA

- 코치 리뷰 요청 생성부터 코치 인박스 조회, 피드백 저장, 학생 요청 목록/알림 반영까지 DB/API 기준으로 검증했습니다.
- 배정되지 않은 코치는 리뷰 요청을 수정할 수 없고, 배정된 코치만 피드백과 상태를 저장할 수 있습니다.
- 코치 인박스에서 필터를 바꿨을 때 상세 패널도 필터된 요청 기준으로 함께 바뀌도록 정리했습니다.

## 최근 변경: 남은 연결 공백 UI 정리

- 게시글 작성 화면에서 실제 저장 API가 없는 임시저장 버튼을 제거하고, 실제 동작하는 발행/수정 흐름만 남겼습니다.
- GitHub 프로젝트 등록 시 기술 스택에 `분석 예정` 같은 placeholder 값을 저장하지 않고 `GitHub`만 기본값으로 둡니다.
- 과거 저장된 `분석 예정` 기술 스택 값은 포트폴리오 API 응답에서 제거해 화면에 데이터처럼 보이지 않게 했습니다.

## 최근 변경: 파트 단위 커밋 운영 기준

- 앞으로 기능 구현, 문서 업데이트, QA가 끝난 작은 단위마다 커밋을 남기도록 `docs/agent/agent.md`에 운영 기준을 추가했습니다.
- 커밋 전에는 `git status`, 프론트 빌드, 백엔드 compile, 필요한 QA 기록을 확인합니다.
- `backend/.env`는 Google OAuth/JWT 민감정보가 있으므로 커밋 대상에서 제외합니다.

## 최근 변경: 학생 핵심 흐름 QA 기록

- 포트폴리오 프로젝트 등록/중복 차단/목록 조회/기록 연결 흐름을 DB/API 기준으로 검증했습니다.
- 게시글 작성 후 내 기록 조회, 댓글 작성, 상세 조회수 증가, 댓글 수 반영 흐름을 검증했습니다.
- AI 도우미 저장 구조인 포트폴리오 초안과 면접 예상 질문 저장을 프로젝트 응답 기준으로 확인했습니다.
- 학생 리뷰 요청 생성, 코치 인박스 조회, 코치 최종 확인 피드백이 학생 요청 목록에 반영되는 왕복 흐름을 검증했습니다.

## 최근 변경: 코치 화면 브라우저 QA 기록

- 코치 세션으로 `/coach-review`, `/posts`, `/settings`가 에러 없이 열리는지 확인했습니다.
- 코치 메뉴에서 대시보드가 보이지 않고, 코치 리뷰 인박스/전체 게시글/설정 중심으로 보이는지 확인했습니다.
- 코치가 학생 전용 화면인 `/portfolio`, `/ai-assistant`, `/my-records`에 직접 접근하면 접근 제한 안내가 보이는지 확인했습니다.
- QA용 임시 사용자와 리뷰 요청 데이터는 검증 후 삭제했습니다.

## 최근 변경: 프로필 업로드 QA 기록

- `PATCH /me/profile`로 이름 수정과 프로필 이미지 업로드가 실제 API 기준으로 동작하는지 검증했습니다.
- 업로드된 이미지는 `/uploads/profiles/...` 정적 파일 경로로 접근 가능함을 확인했습니다.
- Google 재로그인 상황에서도 사용자가 수정한 이름과 업로드 이미지가 덮어써지지 않는지 확인했습니다.

## 최근 변경: 학생 화면 브라우저 QA 기록

- 학생 세션으로 대시보드, 전체 게시글, 게시글 작성/상세/댓글, 내 기록, 포트폴리오 관리, AI 도우미, 코치 리뷰 요청, 설정 화면을 브라우저에서 확인했습니다.
- 긴 GitHub repo 등록 후 다른 화면에 갔다 돌아와도 프로젝트가 유지되고, 같은 repo 중복 등록 시 기존 프로젝트 안내가 보이는지 확인했습니다.
- `GitHub 보기` 링크가 실제 repo URL과 새 탭 대상(`target="_blank"`)을 갖는지 확인했습니다.
- 코치 리뷰 요청 화면에서 게시글과 포트폴리오 프로젝트가 모두 리뷰 대상이 되는지 확인했습니다.
- 확인한 화면에 `Unexpected Application Error`, `[object Object]`, 개발/debug 문구가 보이지 않는지 확인했습니다.

## 최근 변경: 긴 repo 카드 레이아웃 QA 기록

- 긴 GitHub repo 이름을 가진 포트폴리오 카드에서 상태 badge와 코치 badge가 카드 안에 유지되는지 브라우저 bounding box로 확인했습니다.
- 긴 repo 이름 때문에 전체 화면에 가로 스크롤이 생기지 않는지 확인했습니다.

## 최근 변경: GitHub REST API 연동

- 포트폴리오 프로젝트 등록 시 GitHub REST API로 repo metadata, README, languages, 최근 커밋을 가져오도록 연결했습니다.
- 등록된 프로젝트의 `GitHub 정보 새로고침` 버튼은 `/portfolio/projects/{project_id}/github/refresh` API를 호출해 DB 값을 갱신합니다.
- public repo는 `GITHUB_TOKEN` 없이 조회할 수 있고, private repo 또는 rate limit 대응이 필요하면 백엔드 `.env`에 `GITHUB_TOKEN`을 설정합니다.
- 사이드바 JungleLog 로고를 누르면 역할별 기본 화면으로 이동합니다.
- 주요 업무 화면의 최대 폭을 `max-w-7xl`로 넓혀 데스크톱 여백을 줄였습니다.

## 최근 변경: GitHub branch 기준 포트폴리오 관리

- GitHub 프로젝트 등록 시 `/tree/{branch}` 또는 `/blob/{branch}` URL에서 branch를 파싱합니다.
- branch가 없는 repo URL은 GitHub repository metadata의 `default_branch`를 저장합니다.
- README는 GitHub contents API의 `ref`, 최근 커밋은 commits API의 `sha`를 사용해 branch 기준으로 조회합니다.
- GitHub languages API는 repo 단위라 branch별 값을 직접 제공하지 않으므로, branch tree를 조회해 파일 확장자 기반 기술 스택을 우선 추정합니다.
- 포트폴리오 관리 화면은 repo와 branch를 함께 보여주고, 포트폴리오 글은 preview 중심으로 표시합니다.

## 최근 변경: 포트폴리오 게시글 발행과 AI 도우미 정리

- 포트폴리오 프로젝트에 `publishedPostId`를 추가해 프로젝트가 발행한 대표 포트폴리오 게시글을 명확히 연결합니다.
- 포트폴리오 관리 화면에서 `포트폴리오 게시글로 발행`을 누르면 `포트폴리오 관리` 카테고리 게시글을 생성하거나 갱신합니다.
- 발행된 게시글 상세에서는 프로젝트 이름, GitHub repo/branch, 기술 스택, 프로젝트 설명, 연결 기록, 최근 커밋, 코치 피드백 상태, 포트폴리오 글 전체가 보입니다.
- AI 도우미 화면은 프로젝트 선택, 생성 유형 선택, 참고 자료, 생성 결과 저장 흐름으로 정리했습니다.
- 화면 문구는 `초안`보다 `포트폴리오 글` 중심으로 바꾸고, 내부 DB 필드명은 기존 `savedPortfolioDraft`를 유지해 기존 데이터 흐름을 깨지 않게 했습니다.

## 최근 변경: 포트폴리오 관리 액션 버튼 UI 정리

- 포트폴리오 관리 화면의 액션 버튼을 기능이 속한 섹션 근처로 옮겼습니다.
- `포트폴리오 글`, `면접 예상 질문`, `코치 리뷰/피드백`, `연결된 학습 기록` 섹션에서 각각 관련 버튼을 바로 실행할 수 있습니다.
- 하단 액션 영역에는 `포트폴리오 게시글로 발행`, `게시글 보러가기`, `GitHub 보기`, `GitHub 정보 새로고침`만 남겨 프로젝트 단위 작업을 구분했습니다.
- 주요 액션 버튼은 연한 초록색 계열로 맞춰 JungleLog 톤과 버튼 우선순위를 통일했습니다.

## 최근 변경: GitHub README 참고 정보 표시 개선

- 포트폴리오 관리와 AI 도우미의 GitHub 참고 정보 영역에서 `Markdown` 같은 배지가 단독으로 보여 사용자가 의미를 알기 어려운 문제를 줄였습니다.
- 기술 스택/문서 유형 배지 위에 `감지된 기술/문서 유형` 라벨과 설명을 추가했습니다.
- README는 핵심 결과물이 아니라 AI 참고 자료라는 설명을 붙이고, 접힘/펼침 형태로 작게 보여줍니다.

## 최근 변경: 포트폴리오 게시글 상세 전용 UI 개선

- `포트폴리오 관리` 카테고리 게시글은 일반 본문 문자열이 아니라 전용 상세 UI로 렌더링합니다.
- 게시글 제목 화면에서는 `[포트폴리오]` prefix를 숨기고 `프로젝트명 포트폴리오`처럼 자연스럽게 보여줍니다.
- 저장된 Markdown 형식 본문은 화면에서 `##`, `###`, `-` 기호가 그대로 보이지 않도록 섹션별 카드로 파싱해 표시합니다.
- 포트폴리오 상세는 프로젝트 개요, GitHub 정보, 기술 스택, 연결된 학습 기록, 최근 커밋 요약, 코치 피드백 상태, 포트폴리오 글 영역으로 나뉩니다.

## 최근 변경: 포트폴리오 UI 개선 최종 QA

- 포트폴리오 관리 액션 버튼 정리, GitHub README 참고 정보 개선, 포트폴리오 게시글 상세 전용 UI 적용을 기능 단위 커밋으로 나누어 완료했습니다.
- 최종 QA에서 프론트엔드 `npm run build`와 백엔드 compile을 다시 실행해 성공을 확인했습니다.
- `/posts/47` 포트폴리오 게시글 상세에서 `[포트폴리오]`, `##`, `###` 같은 저장용 Markdown 기호가 화면에 노출되지 않는지 확인했습니다.

## 최근 변경: 기술 스택 표시에서 Markdown 제거

- GitHub README가 Markdown 파일이라는 사실은 포트폴리오에서 중요한 기술 스택 정보가 아니므로 화면 표시에서 제외했습니다.
- `Markdown`, `README`, 단독 `GitHub`처럼 실제 구현 기술로 보기 어려운 값은 포트폴리오 관리, AI 도우미, 포트폴리오 게시글 상세에서 숨깁니다.
- README는 계속 `GitHub README 참고 자료` 접힘 영역에서만 확인할 수 있습니다.
