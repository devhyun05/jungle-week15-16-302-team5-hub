# Backend Keyword Map

이 문서는 JungleLog 백엔드 구현 중 나온 학습 키워드를 정리한다. Trello에 적은 공통 학습 키워드를 실제 코드와 연결해서 이해하는 것이 목적이다.

## API / 인증 / 실시간

### REST API

- 상태: 진행 중
- 쓰인 곳: `/posts`, `/comments`, `/portfolio/projects`, `/review-requests`, `/admin/users`, `/auth/*`
- 핵심: URL은 리소스를 나타내고, HTTP method는 행동을 나타낸다.
- 예시:
  - `GET /posts`: 게시글 목록 조회
  - `POST /posts`: 게시글 생성
  - `PATCH /posts/{id}`: 게시글 수정
  - `DELETE /posts/{id}`: 게시글 삭제

### API Design

- 상태: 진행 중
- 쓰인 곳: `docs/agent/api-design.md`, FastAPI router/schema
- 핵심: 프론트와 백엔드가 주고받을 request, response, status code를 미리 정한다.
- 배운 점: 화면 mock data와 실제 API response 필드명을 맞춰야 프론트 연결이 쉬워진다.

### HTTP 3xx / 4xx / 5xx

- 상태: 진행 중
- 쓰인 곳: 게시글/댓글/인증/관리자 API
- 핵심:
  - 3xx: redirect. Google OAuth login에서 사용된다.
  - 4xx: 클라이언트 요청 문제. 401, 403, 404, 422 등.
  - 5xx: 서버 문제. 외부 GitHub API 실패는 502로 전달한다.

### Session / JWT

- 상태: 진행 중
- 쓰인 곳: `backend/app/core/security.py`, `backend/app/dependencies/auth.py`, `backend/app/routers/auth.py`
- 핵심:
  - access token은 짧게 살아 있고 API 인증에 사용한다.
  - refresh token은 access token 재발급에 사용한다.
  - token은 HttpOnly cookie로 저장해 JavaScript에서 직접 읽지 못하게 한다.

### JWT Claim

- 상태: 진행 중
- 쓰인 곳: JWT encode/decode
- 핵심:
  - `sub`: 사용자 식별자
  - `type`: access 또는 refresh 구분
  - `iat`: 발급 시간
  - `exp`: 만료 시간

### Refresh Token / Token Hash

- 상태: 진행 중
- 쓰인 곳: `auth_refresh_tokens` 테이블
- 핵심:
  - refresh token 원문은 DB에 저장하지 않는다.
  - SHA-256 hash만 저장한다.
  - 로그아웃이나 rotation 시 `revoked_at`을 채운다.

### OAuth2 Authorization Code Flow

- 상태: 진행 중
- 쓰인 곳: Google 로그인
- 핵심 흐름:
  1. 브라우저가 Google 로그인 화면으로 이동한다.
  2. Google이 callback URL로 code를 돌려준다.
  3. 백엔드가 code를 access token으로 교환한다.
  4. 백엔드가 Google userinfo에서 email/name/picture/sub를 받는다.
  5. JungleLog 자체 JWT를 발급한다.

### 401 / 403

- 상태: 진행 중
- 핵심:
  - 401 Unauthorized: 로그인 정보가 없거나 token이 유효하지 않다.
  - 403 Forbidden: 로그인은 했지만 역할이나 승인 상태가 맞지 않다.

## Security

### HttpOnly Cookie

- 상태: 진행 중
- 쓰인 곳: access/refresh token 저장
- 핵심: JavaScript에서 token을 직접 읽지 못하므로 XSS 피해를 줄인다.

### SameSite

- 상태: 진행 중
- 핵심: cookie가 외부 사이트 요청에 자동 첨부되는 범위를 제한해 CSRF 위험을 줄인다.

### CORS / CSRF

- 상태: 진행 중
- 쓰인 곳: FastAPI `CORSMiddleware`
- 핵심:
  - CORS는 브라우저가 다른 origin API를 호출할 수 있는지 정한다.
  - JWT를 cookie로 쓰면 CSRF 전략도 같이 고려해야 한다.

### API Key 관리

- 상태: 진행 중
- 쓰인 곳: `GOOGLE_CLIENT_SECRET`, `GITHUB_TOKEN`, 이후 `OPENAI_API_KEY`
- 핵심: 민감한 값은 `.env`에 두고 Git에 커밋하지 않는다.

## PostgreSQL / Data Layer

### SQL

- 상태: 진행 중
- 쓰인 곳: SQLAlchemy query, dbdiagram ERD
- 핵심: 데이터는 테이블, row, column으로 저장되고 query로 조회한다.

### CRUD

- 상태: 진행 중
- 쓰인 곳: 게시글, 댓글, 포트폴리오, 코치 리뷰
- 핵심:
  - Create: INSERT
  - Read: SELECT
  - Update: UPDATE
  - Delete: DELETE 또는 soft delete

### Primary Key / Foreign Key

- 상태: 진행 중
- 쓰인 곳: 모든 주요 테이블
- 핵심:
  - PK는 row를 구분하는 고유 id다.
  - FK는 다른 테이블의 PK를 참조한다.
- 예시:
  - `posts.author_id -> users.id`
  - `comments.post_id -> posts.id`
  - `portfolio_projects.owner_id -> users.id`

### Join Table / N:M

- 상태: 진행 중
- 쓰인 곳: `post_tags`, `portfolio_project_posts`, `review_request_coaches`
- 핵심: 양쪽이 여러 개씩 연결될 수 있으면 중간 테이블이 필요하다.

### Index / UniqueConstraint

- 상태: 진행 중
- 쓰인 곳: 사용자 email/google_sub, repo 중복 방지
- 핵심:
  - index는 조회 속도를 높인다.
  - unique constraint는 중복 저장을 막는다.
- 예시: 같은 사용자가 같은 GitHub repo/branch를 중복 등록하지 못하게 한다.

### Transaction

- 상태: 진행 중
- 쓰인 곳: 게시글+태그 저장, 리뷰 요청+코치 연결, 프로젝트+연결 기록 저장
- 핵심: 여러 DB 작업이 모두 성공하거나 모두 실패해야 데이터가 꼬이지 않는다.

### Soft Delete

- 상태: 진행 중
- 쓰인 곳: 게시글/댓글 삭제
- 핵심: 실제 row를 지우지 않고 `deleted_at`을 채워 목록에서 제외한다.
- 이유: 댓글, 리뷰 요청, 포트폴리오 연결 이력을 보존하기 좋다.

### Data Modeling / Normalization

- 상태: 진행 중
- 쓰인 곳: `docs/agent/db-design.md`, SQLAlchemy models
- 핵심: 중복을 줄이고 관계를 명확히 하기 위해 데이터를 적절한 테이블로 나눈다.

## Language Basics

### Python

- 상태: 진행 중
- 쓰인 곳: FastAPI 백엔드 전체
- 핵심: 라우터, 서비스, repository, model을 Python으로 작성한다.

### Virtual Environment / pip / requirements.txt

- 상태: 진행 중
- 쓰인 곳: `backend/.venv`, `backend/requirements.txt`
- 핵심: 프로젝트별 Python 패키지를 격리하고 재현 가능하게 관리한다.

### Pydantic Schema / DTO

- 상태: 진행 중
- 쓰인 곳: `backend/app/schemas`
- 핵심: request body와 response JSON 모양을 타입으로 정의한다.
- 배운 점: Pydantic validation 실패는 422로 나타난다.

### Error Handling

- 상태: 진행 중
- 쓰인 곳: service/router exception 처리
- 핵심: 실패 상황을 예측 가능한 HTTP status와 message로 바꾼다.

## Async / Cache / 운영

### Configuration

- 상태: 진행 중
- 쓰인 곳: `backend/app/core/config.py`
- 핵심: DB URL, CORS origin, JWT secret, OAuth client id 같은 설정은 코드와 분리한다.

### Logging

- 상태: 예정
- 핵심: 서버 운영 중 문제를 추적하기 위해 요청, 오류, 외부 API 실패를 기록한다.

### Redis / Cache

- 상태: 후순위
- 예정 사용처: AI 결과 캐시, GitHub 분석 결과 캐시, rate limit 완화

### Async / Job Queue

- 상태: 후순위
- 예정 사용처: GitHub 분석, RAG indexing, AI 생성처럼 오래 걸리는 작업

## Architecture / Reliability

### Layered Architecture / MVC

- 상태: 진행 중
- 쓰인 곳: `routers`, `schemas`, `services`, `repositories`, `models`
- 핵심:
  - router: HTTP 요청/응답
  - service: 비즈니스 규칙
  - repository: DB query
  - schema: request/response 타입
  - model: DB 테이블 구조

### Idempotency

- 상태: 진행 중
- 쓰인 곳: 포트폴리오 게시글 발행
- 핵심: 같은 요청을 여러 번 보내도 중복 게시글이 생기지 않아야 한다.
- 예시: 이미 발행된 포트폴리오 글은 새로 만들지 않고 기존 게시글을 갱신한다.

### Retry / Timeout

- 상태: 진행 중
- 쓰인 곳: GitHub API 호출
- 핵심: 외부 API는 느리거나 실패할 수 있으므로 timeout을 설정하고 오류를 명확히 처리한다.

## AI 단계 예정 키워드

### RAG

- 예정 사용처: README 원문, 전체 커밋 메시지, 연결된 학습 기록 검색
- 핵심: LLM이 답변하기 전에 관련 문서를 찾아 근거로 넣는다.

### MCP

- 예정 사용처: GitHub 외부 데이터 조회, 이후 다른 외부 시스템 연결
- 핵심: LLM/Agent가 외부 시스템을 도구처럼 호출하게 한다.

### OpenAI Function Calling

- 예정 사용처: AI 도우미가 포트폴리오 생성, 면접 질문 생성 같은 도구를 선택할 때

### AI Agent Loop

- 예정 사용처: 자료 수집 -> 검색 -> 생성 -> 저장 같은 흐름을 단계적으로 실행할 때
