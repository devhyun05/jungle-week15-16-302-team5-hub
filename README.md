# JungleLog

JungleLog는 크래프톤 정글 수강생이 학습 기록, 트러블슈팅, 프로젝트 회고, 면접 질문, 포트폴리오 자료를 관리하고 코치가 기록을 보고 피드백할 수 있는 AI 게시판 프로젝트입니다.

현재 목표는 **AI 기능 연결 직전까지 실제 웹서비스처럼 동작하는 상태**를 만드는 것입니다. OpenAI/RAG/MCP/Agent 호출은 다음 단계로 남겨두고, 인증/권한/게시판/포트폴리오/코치 리뷰 흐름은 실제 FastAPI API 기준으로 연결했습니다.

## 프로젝트 개요

- 프로젝트명: JungleLog
- 목적: 정글 수강생의 학습 기록과 포트폴리오 관리, 코치 피드백 흐름을 한 서비스 안에 연결
- 주요 사용자: 학생, 코치, 관리자
- 프론트엔드: React, TypeScript, Vite
- 백엔드: FastAPI, SQLAlchemy
- 데이터베이스: PostgreSQL
- 인증: Google OAuth 2.0, JWT access token, refresh token rotation, HttpOnly cookie
- AI 모델 예정: OpenAI API

## 현재 구현 상태

### 완료

- Google OAuth/JWT 인증 API
- access token / refresh token HttpOnly cookie 처리
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
- 포트폴리오 프로젝트와 게시글 연결 API
- 포트폴리오 프로젝트 중복 등록 방지와 GitHub 링크 이동 UI
- 코치 리뷰 요청 생성/취소/목록/인박스/피드백 API와 화면 연결
- 코치 리뷰 인박스에서 게시글/포트폴리오 리뷰 대상 미리보기 제공
- 알림 조회/읽음 처리 API와 헤더 알림 드롭다운 연결
- 관리자 승인, 리뷰 요청, 리뷰 피드백 이벤트 알림 생성
- 게시글 상세 조회 시 조회수 증가 처리
- 대시보드 주요 통계 API 기반 정리
- AI 도우미 화면을 포트폴리오 API 데이터 기반 샘플로 정리
- AI 도우미 화면에 포트폴리오 초안 보관함 UI 추가
- 레거시 `mockData.ts` 제거
- 브라우저 타이틀/메타 정보를 JungleLog 기준으로 정리

### 아직 다음 단계

- 실제 OpenAI API 호출
- RAG vector search와 요약 생성
- GitHub API 또는 MCP 기반 repo 분석 자동화
- MCP server 구현
- Agent 추론 루프 구현
- 실시간 알림
- 실제 Google 계정 선택/동의 화면 수동 QA

## 주요 사용자 흐름

### 학생

1. Google 계정으로 로그인한다.
2. 최초 로그인 시 `승인 대기` 상태가 된다.
3. 관리자가 학생으로 승인하면 서비스 화면에 접근한다.
4. 학습 로그, 트러블슈팅, 프로젝트 회고, 면접 질문, 포트폴리오 관리 글을 작성한다.
5. GitHub repo URL로 포트폴리오 프로젝트를 등록한다.
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
  | - API client fetch(credentials: "include")
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
  v
Repository Layer
  |
  | SQLAlchemy ORM
  v
PostgreSQL
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
- `PUT /portfolio/projects/{project_id}/posts`

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

- 데이터 소스: JungleLog 게시글, 댓글, 포트폴리오 프로젝트, GitHub README/커밋 요약
- 검색 대상: 학생이 작성한 학습 로그, 트러블슈팅, 회고, 면접 질문, 포트폴리오 관리 글
- 예정 Vector DB: PostgreSQL pgvector 또는 ChromaDB
- 예정 기능:
  - 포트폴리오 프로젝트와 연결된 기록 검색
  - 비슷한 게시글 추천
  - 포트폴리오 글 작성 시 근거 기록 요약
  - 면접 예상 질문 생성 시 프로젝트/기록 기반 근거 제공

### MCP 예정 기능

- MCP server를 통해 외부 시스템을 호출할 예정입니다.
- 우선 외부 연동 후보는 GitHub API입니다.
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

남은 수동 QA:

- 실제 브라우저에서 Google 계정 선택과 OAuth 동의 화면 통과
- 실제 관리자 계정으로 신규 사용자 승인 후 프론트 화면 분기 확인
- 실제 COACH 브라우저 화면에서 인박스 확인, 피드백 작성, 학생 알림 반영 확인

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
- 학생/코치/관리자 role이 생기면 단순 CRUD보다 권한 검증이 훨씬 중요해진다.

### 현재 한계

- 실제 Google 계정 선택 후 callback 수동 QA가 아직 남아 있다.
- 알림은 현재 API 기반 조회/읽음 처리까지 지원하며, 실시간 push는 아직 없다.
- GitHub repo 분석은 아직 실제 GitHub API/MCP와 연결되지 않았다.
- AI 도우미는 아직 OpenAI/RAG/MCP/Agent를 호출하지 않는다.

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
