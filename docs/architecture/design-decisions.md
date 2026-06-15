# Design Decisions

## Purpose

이 문서는 GlowBoard를 구현하면서 확정한 주요 설계 결정을 모아 둔다.

`docs/learning/진도_체크포인트.md`는 학습 세션의 시간순 기록이고,
이 문서는 구현자가 따라야 할 현재 설계 기준이다.

세부 설계는 아래 문서도 함께 본다.

- API 계약: `docs/architecture/api-spec.md`
- DB 구조: `docs/architecture/database-erd.md`
- 기능별 구현 지도: `docs/architecture/feature-implementation-map.md`
- 전체 구조: `docs/architecture/system-architecture.md`
- Auth 상세 설계: `docs/architecture/auth-session-design.md`
- 테스트 기준: `docs/testing/test-plan.md`

## Current Product Direction

| Decision | Reason |
|---|---|
| GlowBoard는 global beauty/fashion topic community로 만든다. | 게시판, 댓글, 태그, 검색, AI discovery가 하나의 제품 방향으로 연결된다. |
| 게시글 하나는 하나의 topic만 다룬다. | 댓글 토론, 태그, RAG source 연결이 명확해진다. |
| AI는 board MVP 이후 붙인다. | 게시판 데이터가 먼저 있어야 RAG, MCP, Agent가 실제 맥락을 가진다. |

## Architecture Shape

| Decision | Reason | Implementation Note |
|---|---|---|
| React SPA + FastAPI modular monolith로 시작한다. | 2주 개인 과제에서 end-to-end 구현과 설명이 가장 현실적이다. | `frontend/`, `backend/app/` |
| REST API를 primary API로 둔다. | 게시판 CRUD에 가장 단순하고 Swagger 확인이 쉽다. | `backend/app/api/routes/` |
| PostgreSQL을 기본 DB로 둔다. | 과제 요구사항과 pgvector 확장에 맞는다. | Docker Compose, `DATABASE_URL` |
| Docker PostgreSQL host port는 `55432`로 둔다. | Mac host의 기존 PostgreSQL `5432`와 혼동하지 않는다. | root `.env.example` |
| Redis는 Day 2에서는 rate limit에 사용한다. | 여러 uvicorn worker/process에서도 요청 카운터를 공유할 수 있다. | `backend/app/core/redis.py`, rate limit service |
| RabbitMQ/Celery, pgvector, RAG, MCP, Agent는 게시판 MVP 이후 순서대로 붙인다. | MVP 없이 AI로 넘어가면 구현 근거가 약해진다. | Day 4 이후 |

## Environment And Secrets

| Decision | Reason |
|---|---|
| 실제 `.env`는 agent가 명시 요청 없이 읽지 않는다. | secret 파일 접근 가능성과 읽기 허가는 다르다. |
| `.env.example`은 커밋하고 실제 `.env`는 커밋하지 않는다. | 실행 문서는 남기되 secret 노출을 막는다. |
| root `.env`는 Docker Compose 기준, backend `.env`는 FastAPI 기준으로 본다. | container 생성값과 app runtime 설정의 책임이 다르다. |
| frontend API URL은 frontend env에 둔다. | Vite가 frontend build/runtime에서 API origin을 알아야 한다. |

## Backend Layering

| Decision | Reason | Candidate |
|---|---|---|
| route, schema, service, model을 분리한다. | FastAPI endpoint, Pydantic 계약, business logic, DB 구조가 섞이지 않게 한다. | repository layer는 query가 더 복잡해질 때 도입 |
| authorization check는 backend에서 한다. | frontend UI 숨김만으로는 보안이 되지 않는다. | admin/moderation에서 정책 객체 후보 |
| password는 hash로만 저장한다. | DB 유출 시 원문 비밀번호 노출을 막는다. | password reset 정책은 후보 |

## Auth And Session

상세 기준은 `docs/architecture/auth-session-design.md`를 따른다.

| Decision | Reason |
|---|---|
| 일반 API는 `Authorization: Bearer <access_token>`으로 인증한다. | browser가 자동으로 붙이지 않으므로 일반 API의 CSRF 범위를 줄인다. |
| access token은 frontend authStore 중심으로 둔다. | 여러 화면과 API client가 같은 로그인 상태를 공유한다. |
| access token 수명은 30분으로 둔다. | 상용 기본값처럼 access token은 짧게 두되, 학습/MVP UX를 위해 15분보다 여유 있게 잡는다. |
| refresh token은 HttpOnly cookie에 둔다. | 긴 수명의 token을 JavaScript가 직접 읽지 못하게 한다. |
| refresh/logout에는 CSRF token을 적용한다. | cookie 인증 요청이라 browser 자동 첨부 위험이 있다. |
| refresh session은 7일 idle timeout + 30일 absolute max로 둔다. | 7일 동안 안 오면 로그아웃, 계속 와도 30일 뒤 재로그인한다. |
| refresh token rotation은 `sessions` + `refresh_tokens` 분리 방식으로 구현한다. | session은 기기/브라우저별 로그인 묶음이고, refresh_tokens는 그 안의 token 이력이라 여러 디바이스 관리와 재사용 감지가 명확하다. |
| access token 만료 시 refresh 1회 후 원래 요청 1회 재시도한다. | UX를 유지하되 무한 retry loop를 막는다. |
| logout은 frontend access token 상태를 비우고 backend refresh session을 revoke한다. | stateless access token은 denylist 없이 즉시 서버 폐기되지 않으므로, 30분 만료와 refresh session revoke로 기본 상용 절충안을 잡는다. |

## Frontend State

| State | Location | Reason |
|---|---|---|
| 로그인 사용자, access token | Zustand authStore | 여러 화면에서 공유되고 변경 시 UI가 반응해야 한다. |
| 검색어, 태그, page | URL query | 새로고침, 공유, 뒤로가기에 살아 있어야 한다. |
| 댓글 입력값, form 입력값 | local component state | 특정 화면 안에서만 의미가 있다. |
| posts/comments API 결과 | page component state for now | Day 2 MVP에서는 React Query 없이 단순하게 유지한다. |
| refresh token | HttpOnly cookie | frontend JS가 직접 읽지 않는다. |

Notes:

- Zustand 설치와 authStore 구현은 다른 일이다.
- localStorage는 browser 저장소이고, Zustand는 React 앱 안의 반응형 상태 기준이다.
- Day 2-B 이후 localStorage 직접 접근은 authStore/API client로 모은다.

## Posts, Comments, Tags

| Area | Decision | Reason |
|---|---|---|
| post CRUD | owner-only update/delete | 작성자 권한을 backend에서 보장한다. |
| comment delete | soft delete | 삭제 기록, 신고, 관리자 복구 정책으로 확장하기 좋다. |
| comment edit history | Day 9 candidate | version table, 보존 기간, admin audit 정책이 함께 필요하다. |
| tags | `tags + post_tags` | 게시글과 태그가 N:M 관계이고 태그 재사용이 필요하다. |
| orphan tags | 우선 남겨둔다. | 자동완성, 인기 태그, 통계 확장에 유리하다. |
| tag normalization | trim + lowercase `normalized_name` | 중복 태그 생성을 막는다. |

## Search And Pagination

| Decision | Reason | Candidate |
|---|---|---|
| keyword search는 `ILIKE`로 시작한다. | 구현이 단순하고 Day 2 검색 요구를 만족한다. | full-text search |
| pagination은 offset/page 방식으로 시작한다. | page/size UI와 전체 개수 표시가 쉽다. | cursor pagination |
| list response는 pagination wrapper로 반환한다. | frontend가 page, total, next/prev 여부를 알아야 한다. | infinite scroll |
| 다중 태그 필터는 AND 조건으로 둔다. | 선택한 태그를 모두 포함한 topic을 찾는 동작이 명확하다. | OR/advanced filter |

## Redis Rate Limit

| Decision | Reason |
|---|---|
| Day 2에서는 댓글 작성 API에 적용한다. | 스팸 방지와 직접 연결되고 확인하기 쉽다. |
| 기준은 로그인 사용자 id다. | 댓글 작성은 로그인 사용자 행동이므로 user 기준이 명확하다. |
| key는 `rate:comments:create:{user_id}`로 둔다. | 기능, 동작, 사용자 기준이 key에 드러난다. |
| 알고리즘은 fixed window로 시작한다. | 학습과 구현이 단순하고 TTL로 확인하기 쉽다. |
| 예시 정책은 60초 5회다. | Swagger에서 1~5회 성공, 6회 429를 확인하기 쉽다. |

Candidates:

- login IP/email rate limit
- post create rate limit
- AI quota/concurrency limit
- sliding window 또는 token bucket

## CORS, CSRF, XSS

| Concept | GlowBoard 기준 |
|---|---|
| CORS | Vite frontend `localhost:5173`이 FastAPI `localhost:8000` 응답을 읽을 수 있게 허용한다. |
| CSRF | refresh/logout처럼 cookie 인증을 쓰는 요청에 token 검사를 적용한다. |
| XSS | 사용자 입력이 JavaScript로 실행되지 않게 React escape를 유지하고 unsafe HTML을 피한다. |

Decisions:

- CORS origin은 명시 목록으로 둔다.
- cookie credentials를 쓰는 요청은 frontend `credentials: "include"`와 backend `allow_credentials=True`가 필요하다.
- wildcard origin과 credentials 조합은 쓰지 않는다.
- CSRF token은 XSS 방어가 아니다.
- XSS 방어는 입력 escape, sanitizer, URL 검증, CSP 후보, 30분 access token 수명으로 다룬다.

## Testing Decisions

| Area | Current Standard |
|---|---|
| Backend | pytest route/service integration 중심 |
| Frontend | build/lint와 브라우저 수동 flow 확인 |
| Redis | Swagger/manual로 429 확인, 이후 backend test 보강 |
| Auth refresh/logout | login cookie, refresh CSRF 403, refresh success, rotation, old token reuse revoke, logout CSRF 403, logout session/token revoke, cookie delete, refresh after logout test 통과. frontend login/logout credentials, CSRF header, 401 refresh retry 연결과 build 통과. 브라우저에서 login cookie 저장, readable csrf cookie, HttpOnly refresh token 비노출, logout `X-CSRF-Token`, cookie 삭제 흐름 확인 완료 |
| E2E | signup/login/post/comment/search happy path |

## Implementation Candidates Backlog

이 항목들은 삭제하지 않고 다음 개선 후보로 남긴다.

- repository layer
- comment edit history
- comment pagination for `GET /api/posts/{post_id}/comments`
- orphan tag cleanup batch
- full-text search
- cursor pagination
- refresh token reuse grace window
- access token denylist/blacklist
- per-request session check for access tokens
- device/session management UI
- force logout all sessions
- remember-me option
- sessions user_agent/ip_address/device_name/last_seen_at
- full cookie-based access token auth
- BFF/server-session architecture
- CSP hardening
- login brute-force rate limit
- AI quota and cost guardrail
