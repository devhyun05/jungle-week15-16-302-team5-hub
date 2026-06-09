# GlowBoard 학습 단계별 가이드

이 문서는 GlowBoard를 구현하면서 어떤 순서로 직접 익힐지 정리한 학습용 지도다.

원본 요구사항은 `docs/requirements.md`가 기준이다. 이 가이드는 요구사항을 줄이지 않고, 구현 순서와 학습 순서만 정리한다.

현재 일정표 문서:

- `docs/planning/index.html`

현재 학습 키워드 문서:

- `docs/learning-keywords.html`

## 운영 방식

기존 0~12단계의 이름과 내용은 유지하되, 실제 구현 일정인 Day 0~Day 5에 맞춰 재배치한다.

- `docs/planning/index.html`은 사용자가 학습하면서 보는 상세 일정표다.
- 이 md 문서는 AI agent가 세션을 이어받기 위한 압축 운영 기준이다.
- 일정표가 더 자세한 것이 정상이다. md에는 세부 설명을 모두 복사하지 않고, agent가 놓치면 안 되는 목표, 산출물, 판정 기준, 참고 위치만 둔다.
- 새 Day를 시작할 때 agent는 이 md로 현재 블록을 확인한 뒤, 해당 Day의 일정표 본문에서 산출물, 작업 순서, 수동 확인, 막힘 처리, 멈춤 기준을 다시 확인한다.
- Day는 실제 작업 시간표다.
- Day 안의 A/B/C 블록은 기존 학습 단계 이름을 최대한 살린 세부 순서다.
- 각 블록은 `개념 -> 드릴 -> 구현 -> 확인` 순서로 진행한다.
- 진도 판단은 파일 존재만이 아니라 실제 동작, 테스트, 체크포인트를 함께 본다.

## 전체 매핑

| 일정 | 기존 단계 이름을 살린 학습 블록 |
|---|---|
| Day 0 | 문서와 진도판 세팅 |
| Day 1 | P0 프로젝트 골격 만들기, 데이터 모양과 API 계약 맞추기, Auth vertical slice, Posts CRUD vertical slice |
| Day 2 | Comments, tags, search, pagination, Zustand 상태관리, Redis rate limit |
| Day 3 | GraphQL, SSR, realtime 요구 근거, Worker/RabbitMQ job skeleton |
| Day 4 | pgvector embedding 저장, RAG, MCP JSON-RPC external tool |
| Day 5 | LangGraph Agent, 테스트와 제출 정리, 회고와 남은 학습 반영 |

## 일정표 동기화 기준

일정표에는 학습 설명, 예시 코드, 긴 작업 순서가 더 자세히 들어 있다. 에이전트는 아래 항목이 한쪽 문서에만 남지 않도록 관리한다.

### md가 일정표에서 반드시 받아야 하는 정보

| 일정 | md에 요약되어 있어야 하는 일정표 정보 |
|---|---|
| Day 1 | 제품 설명, 화면 메모, ERD 1차, API 계약, 작동 코드, 최소 테스트, author-only 권한 확인 |
| Day 2 | ERD 확장, 댓글/태그/검색/페이징 API 계약, Zustand store, Redis rate limit, Day 1 회귀 확인 |
| Day 3 | GraphQL posts query, SSR preview, WebSocket demo, SSE progress shape, RabbitMQ/Celery job status skeleton |
| Day 4 | pgvector extension, post_embeddings, embedding worker 저장, similar posts, RAG answer, MCP `tools.list`/`tools.call`, 환경 변수 계약 |
| Day 5 | Agent scenario, StateGraph, tool wrapper, agent run/step 기록, max step guard, Evidence Matrix, README, 데모 스크립트 |

### 일정표가 md에서 반드시 받아야 하는 정보

| md 정보 | 일정표에 보여야 하는 형태 |
|---|---|
| Day 0 문서와 진도판 세팅 | overview에 준비 단계로 표시 |
| 학습 세션 시작 순서 | `진도_체크포인트.md`를 먼저 읽는 규칙 표시 |
| 학습 코치 운영 방식 | concept -> drill -> check -> small implementation 흐름 표시 |
| 추가 학습/작업 항목 | 각 Day의 `먼저 배울 개념`, `만들 파일 후보`, 일정표의 관련 작업 단계 안에 직접 표시 |
| 체크포인트 갱신 | Day가 끝날 때 완료 산출물, 검증, 남은 위험을 기록하는 규칙 표시 |

### 에이전트용 Day 시작 체크

각 Day를 시작할 때 아래 순서로 확인한다.

1. `docs/learning/진도_체크포인트.md`에서 현재 위치와 남은 위험을 읽는다.
2. 이 문서에서 해당 Day의 A/B/C 블록과 완료 기준을 확인한다.
3. `docs/planning/index.html`에서 같은 Day의 `오늘 끝나야 하는 것`, `오늘의 산출물`, `파일 지도`, `API 계약`, `수동 확인`, `막히면 보는 순서`, `오늘 멈추면 안 되는 기준`을 확인한다.
4. 구현 중 새로 생긴 학습/작업 항목은 별도 후보 파일에 쌓지 않고 해당 Day의 일정표 관련 작업 단계와 이 문서의 Day 항목에 직접 넣는다.
5. Day가 끝나면 체크포인트에 실제 동작, 테스트, 수동 확인, 남은 위험을 작게 기록한다.

## 일정표 항목 정합성 표

아래 표는 `docs/planning/index.html`의 Day별 항목을 AI agent가 빠르게 대조하기 위한 것이다. 일정표의 설명은 더 자세할 수 있지만, 최소한 아래의 `볼 문서/읽을 자료`, `만들 파일 후보`, `먼저 배울 개념`, `산출물/완료 기준`은 md와 일정표가 같은 방향이어야 한다.

### Day 1 정합성

#### 볼 문서 / 읽을 자료

- `docs/product/feature-spec.md`
- `docs/product/user-flow.md`
- `docs/architecture/api-spec.md`
- `docs/architecture/database-erd.md`
- `README.md`
- 일정표 읽을 자료 카드: JavaScript, TypeScript, React, Tailwind, FastAPI, JWT Auth, PostgreSQL / SQLAlchemy

#### 만들 파일 후보

- `frontend/`
- `backend/`
- `docker-compose.yml`
- `.env.example`
- `README.md`
- `frontend/src/types/auth.ts`
- `frontend/src/types/post.ts`
- `frontend/src/api/client.ts`
- `frontend/src/api/auth.ts`
- `frontend/src/api/posts.ts`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/SignupPage.tsx`
- `frontend/src/pages/PostListPage.tsx`
- `frontend/src/pages/PostDetailPage.tsx`
- `frontend/src/pages/PostCreatePage.tsx`
- `frontend/src/pages/PostEditPage.tsx`
- `frontend/src/components/PostCard.tsx`
- `frontend/src/components/PostForm.tsx`
- `frontend/src/stores/authStore.ts`
- `backend/app/models/user.py`
- `backend/app/models/post.py`
- `backend/app/models/session.py`
- `backend/app/schemas/auth.py`
- `backend/app/schemas/post.py`
- `backend/app/api/routes/auth.py`
- `backend/app/api/routes/posts.py`
- `backend/app/services/auth_service.py`
- `backend/app/services/post_service.py`
- `backend/app/repositories/post_repository.py`
- `backend/app/main.py`
- `backend/app/core/security.py`
- `backend/app/core/config.py`
- `backend/alembic/`
- `backend/tests/`
- `docs/architecture/`
- `docs/learning/backend-auth-drills.md`
- `docs/learning/db-migration-drills.md`

#### 먼저 배울 개념

- JavaScript event, array/object, async/await, fetch
- TypeScript interface와 API request/response type
- React component, props, state, useEffect, form event
- Tailwind 기본 layout/input/button 스타일
- FastAPI route, request body, dependency, Pydantic schema
- JWT, password hash, Authorization header
- PostgreSQL table, PK, FK, unique index
- SQLAlchemy model, session, commit/rollback
- API 계약과 frontend/backend type/schema 정합성
- 401과 403 차이
- API client error normalization
- React form validation
- Pydantic v2 validation details
- Alembic rollback and migration discipline
- password hashing detail
- JWT expiry and refresh strategy
- CORS and credential policy
- settings management
- Docker Compose healthcheck
- service startup commands
- architecture decision record
- API changelog

#### 산출물 / 완료 기준

- README에 넣을 제품 설명 2~3문장
- Login, Post List, Post Detail, Post Form 화면 메모
- users, sessions, posts ERD 1차
- auth API와 posts CRUD API 계약
- signup, login, current user, logout 흐름
- 게시글 작성, 목록, 상세, 수정, 삭제
- 작성자만 수정/삭제 가능한 backend 권한 검사
- signup, login, create post, author-only update/delete 최소 테스트
- 오늘 멈추면 안 되는 기준: 로그인한 사용자가 실제 DB에 게시글을 저장한다.

### Day 2 정합성

#### 볼 문서 / 읽을 자료

- `docs/architecture/database-erd.md`
- `docs/architecture/api-spec.md`
- `docs/product/feature-spec.md`
- 일정표 읽을 자료 카드: SQLAlchemy Relationship, FastAPI Query Parameter, Zustand, Redis Rate Limit

#### 만들 파일 후보

- `backend/app/models/comment.py`
- `backend/app/models/tag.py`
- `backend/app/models/post.py`
- `backend/app/schemas/comment.py`
- `backend/app/schemas/tag.py`
- `backend/app/schemas/post.py`
- `backend/app/api/routes/comments.py`
- `backend/app/api/routes/tags.py`
- `backend/app/api/routes/posts.py`
- `backend/app/services/comment_service.py`
- `backend/app/services/tag_service.py`
- `backend/app/services/post_service.py`
- `backend/app/services/rate_limit_service.py`
- `backend/app/core/rate_limit.py`
- `backend/alembic/`
- `frontend/src/api/comments.ts`
- `frontend/src/api/tags.ts`
- `frontend/src/api/posts.ts`
- `frontend/src/components/CommentList.tsx`
- `frontend/src/components/CommentForm.tsx`
- `frontend/src/components/TagInput.tsx`
- `frontend/src/components/SearchBox.tsx`
- `frontend/src/components/Pagination.tsx`
- `frontend/src/components/SearchFilters.tsx`
- `frontend/src/stores/authStore.ts`
- `frontend/src/stores/postFilterStore.ts`
- `backend/app/repositories/`
- `docker-compose.yml`
- `docs/learning/react-api-state-drills.md`
- `backend/tests/test_comments.py`
- `backend/tests/test_tags.py`
- `backend/tests/test_posts_search.py`
- `backend/tests/test_rate_limit.py`

#### 먼저 배울 개념

- one-to-many relationship
- many-to-many relationship
- join table
- SQLAlchemy relationship loading
- FastAPI query parameter
- pagination response
- search query state
- URL query string과 Zustand state 차이
- local state, global client state, server state 차이
- Redis TTL
- Redis INCR/EXPIRE 기반 fixed window rate limit
- 429 rate limit response
- regression check
- URL query state
- Zustand persist 전략
- optimistic UI와 rollback
- transaction boundary
- soft delete policy
- PostgreSQL full-text search vs ILIKE
- composite index design
- unique constraint and upsert
- Redis TTL and cache invalidation
- API changelog

#### 산출물 / 완료 기준

- Day 1 signup, login, posts CRUD 회귀 확인
- comments, tags, post_tags ERD와 migration
- 댓글 목록, 작성, 수정, 삭제 API
- 태그 생성/재사용/중복 방지 정책
- 게시글 작성/수정 request의 `tag_names`
- 게시글 목록의 `q`, `tag`, `page`, `size` query parameter
- `PostPage` 형태의 pagination response
- Post Detail의 댓글/태그 UI
- Post List의 검색/페이징 UI
- Zustand auth 또는 UI store
- Redis rate limit과 429 응답
- 댓글 권한, 태그 중복, 검색/페이징, rate limit 테스트 또는 수동 확인
- 오늘 멈추면 안 되는 기준: 게시글 상세에서 댓글과 태그가 보이고, 목록에서 검색/페이징이 되며, Zustand와 Redis rate limit 근거가 코드에 남아 있다.

### Day 3 정합성

#### 볼 문서 / 읽을 자료

- `docs/architecture/system-architecture.md`
- `docs/architecture/api-spec.md`
- `docs/testing/test-plan.md`
- 일정표 읽을 자료 카드: Async와 Event Loop, RabbitMQ와 Celery, SSE와 EventSource, WebSocket, GraphQL과 SSR

#### 만들 파일 후보

- `backend/app/models/job.py`
- `backend/app/schemas/job.py`
- `backend/app/services/job_service.py`
- `backend/app/services/post_service.py`
- `backend/app/services/post_embedding_service.py`
- `backend/app/core/logging.py`
- `backend/app/worker/celery_app.py`
- `backend/app/worker/tasks.py`
- `backend/app/api/routes/jobs.py`
- `backend/app/api/routes/realtime.py`
- `backend/app/api/routes/ws.py`
- `backend/app/api/routes/graphql.py`
- `backend/app/api/routes/preview.py`
- `frontend/src/components/JobStatusBadge.tsx`
- `frontend/src/pages/RealtimeDemoPage.tsx`
- `docker-compose.yml`
- `backend/tests/`
- `docs/architecture/`
- `backend/tests/test_jobs.py`
- `backend/tests/test_realtime.py`

#### 먼저 배울 개념

- async와 event loop
- background task와 job queue 차이
- RabbitMQ broker
- Celery worker
- job status: queued, running, succeeded, failed
- idempotency key
- retry와 failure logging
- centralized logging
- Docker Compose healthcheck
- RabbitMQ retry and dead letter queue
- idempotency key design
- test database strategy
- architecture decision record
- SSE와 EventSource
- WebSocket과 SSE 차이
- GraphQL query/resolver
- CSR과 SSR 차이
- HTMLResponse preview
- service/API/worker/realtime endpoint 테스트 분리

#### 산출물 / 완료 기준

- Day 1~2 기능 회귀 확인
- FastAPI, RabbitMQ, Celery worker, jobs table, SSE 관계 설계
- RabbitMQ docker service
- Celery app과 worker task
- jobs table과 migration
- post create/update 후 embedding 준비 job enqueue
- job status API
- `GET /api/jobs/{job_id}/events` SSE endpoint
- frontend EventSource 기반 job 상태 표시
- WebSocket echo 또는 activity endpoint
- GraphQL posts query
- SSR post preview HTML endpoint
- job 생성, 중복 방지, status, realtime 근거 테스트 또는 수동 확인
- 오늘 멈추면 안 되는 기준: 게시글을 작성하면 job이 생성되고, worker가 job 상태를 바꾸며, frontend가 진행 상태를 볼 수 있다.

### Day 4 정합성

#### 볼 문서 / 읽을 자료

- `docs/ai/rag-design.md`
- `docs/ai/mcp-design.md`
- `docs/architecture/api-spec.md`
- `docs/testing/test-plan.md`
- 일정표 읽을 자료 카드: Embedding과 RAG 개념, pgvector, LLM / Embedding client, JSON-RPC와 MCP, 외부 API와 안정성

#### 만들 파일 후보

- `backend/alembic/versions/*_add_pgvector_post_embeddings.py`
- `backend/app/models/post_embedding.py`
- `backend/app/ai/embedding_service.py`
- `backend/app/services/post_embedding_service.py`
- `backend/app/services/vector_search_service.py`
- `backend/app/worker/tasks.py`
- `backend/app/ai/rag_service.py`
- `backend/app/ai/llm_service.py`
- `backend/app/schemas/rag.py`
- `backend/app/api/routes/ai.py`
- `backend/app/api/routes/posts.py`
- `backend/app/mcp/server.py`
- `backend/app/mcp/schemas.py`
- `backend/app/mcp/tools.py`
- `backend/app/services/external_weather_service.py`
- `frontend/src/api/ai.ts`
- `frontend/src/api/posts.ts`
- `frontend/src/api/mcp.ts`
- `frontend/src/components/SimilarPostsPanel.tsx`
- `frontend/src/components/RagQuestionBox.tsx`
- `frontend/src/components/RagAnswerPanel.tsx`
- `frontend/src/components/SourceList.tsx`
- `frontend/src/components/ToolDebugPanel.tsx`
- `backend/tests/test_embeddings.py`
- `backend/tests/test_vector_search.py`
- `backend/tests/test_rag.py`
- `backend/tests/test_mcp.py`
- `backend/tests/test_external_weather.py`
- `docs/retrospective/limitations-and-improvements.md`
- `docs/learning/rag-mcp-agent-drills.md`

#### 먼저 배울 개념

- embedding
- vector search
- pgvector extension
- vector distance query
- cosine, inner product, L2
- content hash
- upsert
- mock embedding fallback
- context builder
- prompt template
- source citation
- LLM client와 embedding client
- JSON-RPC 2.0
- MCP `tools.list` / `tools.call`
- tool registry
- external HTTP timeout
- retry
- circuit breaker
- URL validation과 SSRF 위험
- mock 테스트 전략
- pgvector distance metrics
- vector index tuning
- LLM provider selection matrix
- prompt versioning
- RAG evaluation checklist
- mock embedding quality limits
- URL metadata security and SSRF
- JSON-RPC error code drill
- AI cost and rate limit
- Redis TTL and cache invalidation
- architecture decision record

#### 산출물 / 완료 기준

- Day 1~3 기능 회귀 확인
- `CREATE EXTENSION IF NOT EXISTS vector`
- `post_embeddings` table: `post_id`, `embedding`, `embedding_model`, `content_hash`
- 게시글 title/content/tags를 embedding 입력으로 합치는 정책
- API key가 없을 때 mock embedding fallback
- embedding worker가 실제 저장까지 연결
- similar posts API와 자기 자신 제외 정책
- RAG answer API와 `answer` + `sources` response
- source가 부족하면 부족하다고 말하는 fallback
- MCP JSON-RPC server
- `tools.list`, `tools.call`
- 실제 external service tool 하나, Day 4 MVP는 key 없이 테스트 가능한 weather tool
- 외부 API/LLM timeout, retry, circuit breaker 근거
- `.env.example`의 LLM/external API 환경 변수 이름
- RAG/MCP 설계 문서에 후보, 결정, 확인, 나중 항목 기록
- 오늘 멈추면 안 되는 기준: 게시글 embedding이 저장되고, RAG 답변이 sources와 함께 반환되며, MCP tool이 실제 외부 API를 호출한다.

### Day 5 정합성

#### 볼 문서 / 읽을 자료

- `docs/ai/agent-design.md`
- `docs/testing/test-plan.md`
- `docs/retrospective/limitations-and-improvements.md`
- `README.md`
- 일정표 읽을 자료 카드: LangGraph 기본, Tool Calling과 Function Calling, Memory/State/Loop Prevention, 테스트와 제출 README

#### 만들 파일 후보

- `backend/app/ai/agent/state.py`
- `backend/app/ai/agent/graph.py`
- `backend/app/ai/agent/tools.py`
- `backend/app/ai/agent/service.py`
- `backend/app/models/agent_run.py`
- `backend/app/models/agent_step.py`
- `backend/app/schemas/agent.py`
- `backend/app/api/routes/agent.py`
- `frontend/src/api/agent.ts`
- `frontend/src/components/AgentPanel.tsx`
- `frontend/src/components/AgentStepList.tsx`
- `frontend/src/components/AgentAnswer.tsx`
- `frontend/src/components/AgentSourceList.tsx`
- `frontend/src/components/ToolResultCard.tsx`
- `backend/tests/test_agent_plan_node.py`
- `backend/tests/test_agent_tools.py`
- `backend/tests/test_agent_graph.py`
- `backend/tests/test_agent_limits.py`
- `backend/tests/test_agent_api.py`
- `backend/tests/test_agent_records.py`
- `backend/tests/test_submission_smoke.py`
- `frontend/src/**/*.test.tsx`
- `frontend/e2e/`
- `.github/workflows/`
- `frontend/src/components/AgentTrace.tsx`
- `backend/app/ai/llm_service.py`
- `docs/planning/`
- `docs/architecture/`
- `docs/architecture/api-spec.md`
- `docs/learning/rag-mcp-agent-drills.md`
- `docs/planning/schedule.md`
- `README.md`
- 데모 스크린샷 폴더

#### 먼저 배울 개념

- LangGraph StateGraph
- AgentState
- node
- edge
- conditional edge
- tool wrapper
- tool calling / function calling
- allowed tool registry
- agent run
- agent step
- memory/state
- max_steps
- recursion limit
- fallback answer
- safe error message
- sanitization
- smoke test
- Evidence Matrix
- README requirement evidence table
- known limitations
- 접근성 테스트 with Testing Library
- Playwright auth fixture
- test database strategy
- CI smoke checks
- RAG evaluation checklist
- prompt versioning
- mock embedding quality limits
- Agent checkpointing
- Agent trace UX
- AI cost and rate limit
- demo script
- known limitations format
- architecture decision record
- API changelog

#### 산출물 / 완료 기준

- Day 1~4 기능 회귀 확인
- Agent 시나리오 한 문장
- `AgentState`
- LangGraph node: `plan`, `retrieve_board_context`, `call_weather_tool`, `generate_answer`
- conditional edge로 RAG-only / RAG+MCP 분기
- RAG tool wrapper
- MCP weather tool wrapper
- `agent_runs`, `agent_steps` table
- run 생성, run 조회, step 조회 API
- frontend AgentPanel에서 질문, 진행 단계, 최종 답변, sources, tool result 표시
- `max_steps`와 recursion limit
- tool 실패 fallback answer
- secret, raw exception, full prompt가 실행 기록/응답에 저장되지 않음
- Agent max_steps, RAG wrapper, MCP wrapper, graph 분기, run API 테스트 또는 수동 확인
- README 실행 방법, 환경 변수, 아키텍처, RAG/MCP/Agent 구조, Evidence 표, 테스트, 데모, 한계와 개선점
- 데모 스크립트: 게시판 -> RAG -> MCP -> Agent -> Evidence
- 오늘 멈추면 안 되는 기준: Agent가 RAG와 MCP tool을 실제로 호출하고, 테스트/README/데모/한계 정리가 제출 가능한 상태다.

## Day 0. 문서와 진도판 세팅

### 목표

학습 코치가 어느 문서를 기준으로 세션을 시작하고 끝낼지 정한다.

### 볼 파일

- `AGENTS.md`
- `docs/learning/GLOWBOARD_학습코치_AGENT.md`
- `docs/learning/진도_체크포인트.md`

### 여기서 이해할 것

- `AGENTS.md`는 프로젝트 공통 규칙이다.
- 학습 코치 문서는 에이전트의 수업 방식이다.
- 진도 체크포인트는 다음 세션이 어디서 이어갈지 알려준다.
- 새로 생기는 학습/작업 항목은 일정표와 단계별 가이드의 해당 Day에 직접 반영한다.

### 완료 기준

- 학습 문서 세트가 존재한다.
- 현재 일정표가 `docs/planning/index.html`임을 말할 수 있다.
- 다음 구현 Day와 첫 학습 블록이 무엇인지 말할 수 있다.

## Day 1. 로그인 가능한 게시판 골격 만들기

Day 1은 기존 1~4단계를 한 구현 흐름으로 묶는다. 오늘의 끝은 사용자가 회원가입하고 로그인한 뒤 topic을 작성, 조회, 수정, 삭제할 수 있는 상태다.

### Day 1-A. P0 프로젝트 골격 만들기

#### 목표

React frontend, FastAPI backend, PostgreSQL 기반 개발 환경을 만든다.

#### 만들 파일과 폴더 후보

- `frontend/`
- `backend/`
- `docker-compose.yml`
- `.env.example`
- `README.md`

#### 먼저 배울 개념

- monorepo 폴더 구조
- Vite React app
- FastAPI app entrypoint
- PostgreSQL service
- environment variable
- Docker Compose service

#### 드릴 예시

```text
frontend는 화면을 담당한다.
backend는 ________를 담당한다.
PostgreSQL은 ________를 저장한다.
.env.example은 실제 비밀값이 아니라 ________를 기록한다.
```

#### 완료 기준

- frontend dev server가 실행된다.
- backend `/health`가 응답한다.
- PostgreSQL service가 실행된다.
- `.env`는 commit 대상이 아니고 `.env.example`만 남는다.

### Day 1-B. 데이터 모양과 API 계약 맞추기

#### 목표

GlowBoard topic, user, comment, tag의 데이터 모양을 frontend type, backend schema, DB model로 나눈다.

#### 볼 문서

- `docs/product/feature-spec.md`
- `docs/product/user-flow.md`
- `docs/architecture/api-spec.md`
- `docs/architecture/database-erd.md`

#### 만들 파일 후보

- `frontend/src/types/auth.ts`
- `frontend/src/types/post.ts`
- `backend/app/schemas/auth.py`
- `backend/app/schemas/post.py`
- `backend/app/models/user.py`
- `backend/app/models/post.py`
- `backend/app/models/session.py`

#### 먼저 배울 개념

- TypeScript interface
- Pydantic schema
- SQLAlchemy model
- optional field와 nullable field 차이
- request type과 response type 차이

#### 완료 기준

- post create request와 post response의 차이를 설명할 수 있다.
- user와 post의 relationship을 FK로 설명할 수 있다.
- API spec의 필드 이름과 frontend/backend type 이름이 어긋나지 않는다.

### Day 1-C. Auth vertical slice

#### 목표

회원가입, 로그인, current user 조회, 로그아웃 흐름을 먼저 닫는다.

#### 만들 파일 후보

- `backend/app/api/routes/auth.py`
- `backend/app/services/auth_service.py`
- `backend/app/core/security.py`
- `frontend/src/api/auth.ts`
- `frontend/src/stores/authStore.ts`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/SignupPage.tsx`

#### 먼저 배울 개념

- password hash
- JWT 또는 access token
- FastAPI dependency
- 401 vs 403
- Zustand auth store
- protected route

#### 드릴 예시

```text
비밀번호 원문은 DB에 저장하지 않고 ________를 저장한다.
로그인하지 않은 요청은 주로 HTTP ________가 된다.
로그인했지만 owner가 아니면 HTTP ________가 된다.
frontend는 token을 API 요청 ________에 붙인다.
```

#### 완료 기준

- signup API가 user를 만든다.
- login API가 token과 user를 반환한다.
- `/auth/me`가 token이 있을 때만 current user를 반환한다.
- frontend에서 로그인 상태가 유지되고 로그아웃하면 지워진다.

### Day 1-D. Posts CRUD vertical slice

#### 목표

게시글 작성, 목록, 상세, 수정, 삭제를 backend와 frontend까지 연결한다.

#### 만들 파일 후보

- `backend/app/api/routes/posts.py`
- `backend/app/services/post_service.py`
- `backend/app/repositories/post_repository.py`
- `frontend/src/api/posts.ts`
- `frontend/src/pages/PostListPage.tsx`
- `frontend/src/pages/PostDetailPage.tsx`
- `frontend/src/pages/PostCreatePage.tsx`
- `frontend/src/pages/PostEditPage.tsx`
- `frontend/src/components/PostCard.tsx`
- `frontend/src/components/PostForm.tsx`

#### 먼저 배울 개념

- CRUD
- route parameter
- query parameter
- service layer authorization
- React Router
- controlled form
- loading, error, empty state

#### 완료 기준

- 로그인 사용자가 topic을 작성할 수 있다.
- 목록에서 작성한 topic이 보인다.
- 상세 화면이 topic id로 데이터를 불러온다.
- owner만 수정/삭제할 수 있고 backend도 권한을 검사한다.

### Day 1 전체 완료 기준

- Day 1-A~D의 완료 기준이 모두 충족된다.
- signup, login, create post, author-only update/delete 최소 테스트가 있다.
- README 초안에 GlowBoard 제품 설명과 Day 1 구현 근거를 적을 수 있다.

## Day 2. 게시판을 커뮤니티 기능으로 확장하기

Day 2는 기존 5단계와 6단계 일부를 묶는다. Day 1의 로그인과 게시글 CRUD를 보호한 상태에서 댓글, 태그, 검색, 페이징, 상태관리, Redis 근거를 붙인다.

### Day 2-A. Comments, tags, search, pagination

#### 목표

게시판다운 탐색 기능과 토론 기능을 붙인다.

#### 만들 파일 후보

- `backend/app/models/comment.py`
- `backend/app/models/tag.py`
- `backend/app/schemas/comment.py`
- `backend/app/schemas/tag.py`
- `backend/app/api/routes/comments.py`
- `backend/app/api/routes/tags.py`
- `backend/app/services/comment_service.py`
- `backend/app/services/tag_service.py`
- `backend/app/services/rate_limit_service.py`
- `frontend/src/api/comments.ts`
- `frontend/src/api/tags.ts`
- `frontend/src/components/CommentList.tsx`
- `frontend/src/components/CommentForm.tsx`
- `frontend/src/components/TagInput.tsx`
- `frontend/src/components/SearchBox.tsx`
- `frontend/src/components/Pagination.tsx`
- `frontend/src/components/SearchFilters.tsx`

#### 먼저 배울 개념

- one-to-many relationship
- many-to-many relationship
- join table
- pagination response
- search query state
- URL query string 또는 Zustand state

#### 완료 기준

- topic detail에서 comment를 읽고 작성할 수 있다.
- tag를 생성하거나 재사용할 수 있다.
- 목록에서 keyword, tag, board/category filter가 동작한다.
- page와 size가 API와 UI에서 일관되게 동작한다.

### Day 2-B. Zustand 상태관리와 Redis rate limit

#### 목표

반복해서 쓰는 UI/auth 상태를 정리하고, Redis를 사용한 rate limit 또는 cache 근거를 남긴다.

#### 만들 파일 후보

- `frontend/src/stores/authStore.ts`
- `frontend/src/stores/uiStore.ts`
- `frontend/src/components/SearchFilters.tsx`
- `backend/app/core/rate_limit.py`
- `backend/app/main.py`
- `docker-compose.yml`

#### 먼저 배울 개념

- client state와 server state 차이
- Zustand store
- token 저장 정책
- URL query state와 전역 상태의 차이
- Redis TTL
- fixed window rate limit

#### 완료 기준

- 로그인 사용자 또는 UI 상태가 필요한 범위만 store에 들어간다.
- 검색어, tag, board, page는 URL query 또는 명확한 상태 정책으로 유지된다.
- Redis를 사용한 rate limit 또는 cache 근거가 실제 코드에 있다.
- README에 token 저장과 Redis 사용 이유를 짧게 설명할 수 있다.

### Day 2 전체 완료 기준

- Day 1 로그인과 게시글 CRUD가 여전히 동작한다.
- 댓글 권한, 태그 중복, 검색/페이징, rate limit 테스트 또는 수동 확인 기록이 있다.
- README에 Day 2 요구사항 키워드 근거를 옮길 수 있다.

## Day 3. 비동기 처리와 실시간 진행 상태 만들기

Day 3은 기존 6단계 나머지와 7단계 일부를 묶는다. AI를 바로 붙이기보다, AI 작업을 나중에 붙여도 버틸 수 있는 비동기/실시간 기반을 만든다.

### Day 3-A. GraphQL, SSR, realtime 요구 근거

#### 목표

요구사항에 있는 주변 기술을 얇지만 실제 동작하는 기능으로 남긴다.

#### 만들 파일 후보

- `backend/app/api/routes/graphql.py`
- `backend/app/api/routes/preview.py`
- `backend/app/api/routes/realtime.py`
- `backend/app/api/routes/ws.py`
- `frontend/src/pages/RealtimeDemoPage.tsx`

#### 먼저 배울 개념

- GraphQL query and resolver
- SSR preview HTMLResponse
- WebSocket connection lifecycle
- SSE event stream
- realtime progress event shape

#### 완료 기준

- GraphQL posts query가 동작한다.
- public post preview route가 HTML을 반환한다.
- WebSocket demo endpoint가 연결된다.
- SSE progress route의 기본 shape가 있다.

### Day 3-B. Worker/RabbitMQ job skeleton

#### 목표

AI 기능 전에 embedding job을 비동기로 처리할 기반을 만든다. Day 3에서는 queue와 status 흐름을 우선 만들고, 실제 embedding 저장은 Day 4에서 닫는다.

#### 만들 파일 후보

- `backend/app/worker/celery_app.py`
- `backend/app/worker/tasks.py`
- `backend/app/services/job_service.py`
- `backend/app/models/job.py`
- `backend/app/schemas/job.py`
- `backend/app/api/routes/jobs.py`
- `frontend/src/components/JobStatusBadge.tsx`
- `docker-compose.yml`

#### 먼저 배울 개념

- job queue
- RabbitMQ broker
- Celery worker
- idempotency key
- retry
- job status
- failure logging

#### 완료 기준

- post 생성 또는 수정 후 embedding job이 enqueue된다.
- worker가 skeleton task를 처리하고 status를 갱신한다.
- job status API 또는 SSE progress에서 pending/running/succeeded/failed 흐름을 볼 수 있다.
- 실패 시 error message가 남고 원본 post 데이터는 잃지 않는다.

### Day 3 전체 완료 기준

- Day 1~2의 로그인, 게시글, 댓글, 태그, 검색, 페이징이 계속 동작한다.
- GraphQL, SSR, WebSocket, SSE, RabbitMQ/worker 근거가 코드나 문서에 남아 있다.
- README나 architecture 문서에 왜 Day 3 구조가 Day 4 RAG의 기반인지 설명할 수 있다.

## Day 4. RAG와 MCP를 실제 AI 기능으로 연결하기

Day 4는 기존 7단계 나머지와 8~9단계를 묶는다. 게시글 데이터가 AI 기능의 근거가 되도록 pgvector 저장, RAG, MCP를 차례로 닫는다.

### Day 4-A. pgvector embedding 저장

#### 목표

Day 3의 job skeleton을 실제 embedding 생성과 pgvector 저장 흐름으로 바꾼다.

#### 만들 파일 후보

- `backend/app/models/post_embedding.py`
- `backend/app/ai/embedding_service.py`
- `backend/app/services/post_embedding_service.py`
- `backend/app/services/vector_search_service.py`
- `backend/app/worker/tasks.py`
- `backend/alembic/`

#### 먼저 배울 개념

- pgvector extension
- vector similarity
- cosine, inner product, L2 차이
- mock embedding fallback
- vector index
- upsert

#### 완료 기준

- API key가 없어도 mock embedding fallback으로 flow가 유지된다.
- pgvector table에 embedding이 저장된다.
- post update가 중복 job을 과하게 만들지 않도록 idempotency 기준이 있다.
- similar search가 RAG 전에 단독으로 확인된다.

### Day 4-B. RAG

#### 목표

GlowBoard 게시글과 댓글을 근거로 관련 topic과 Q&A 답변을 만든다.

#### 먼저 갱신할 문서

- `docs/ai/rag-design.md`

#### 만들 파일 후보

- `backend/app/ai/rag_service.py`
- `backend/app/ai/llm_service.py`
- `backend/app/schemas/rag.py`
- `backend/app/api/routes/ai.py`
- `frontend/src/components/RagQuestionBox.tsx`
- `frontend/src/components/RagAnswerPanel.tsx`
- `frontend/src/components/SourceList.tsx`

#### 먼저 배울 개념

- embedding
- vector search
- context builder
- prompt template
- source citation
- mock fallback

#### 완료 기준

- similar topics API가 동작한다.
- RAG answer API가 먼저 board data를 검색한다.
- 답변에 source post가 포함된다.
- 관련 source가 부족하면 부족하다고 말한다.

### Day 4-C. MCP JSON-RPC external tool

#### 목표

외부 서비스를 JSON-RPC 기반 도구로 호출한다.

#### 먼저 갱신할 문서

- `docs/ai/mcp-design.md`

#### 만들 파일 후보

- `backend/app/mcp/server.py`
- `backend/app/mcp/schemas.py`
- `backend/app/mcp/tools.py`
- `backend/app/services/external_weather_service.py`
- `frontend/src/api/mcp.ts`
- `frontend/src/components/ToolDebugPanel.tsx`

#### 먼저 배울 개념

- JSON-RPC 2.0
- method, params, id
- tool registry
- external HTTP timeout
- URL validation
- recoverable error

#### 완료 기준

- MCP server가 JSON-RPC request를 받는다.
- 최소 1개 real external service를 호출한다.
- FastAPI가 MCP server를 호출한다.
- 실패해도 원본 사용자 입력을 잃지 않는다.

### Day 4 전체 완료 기준

- Day 1~3 기능이 유지되고, 게시글 작성 후 embedding job이 실제 저장까지 이어진다.
- RAG와 MCP가 Day 5 Agent 없이도 단독으로 동작한다.
- `docs/ai/rag-design.md`와 `docs/ai/mcp-design.md`에 구현 직전 결정이 남아 있다.

## Day 5. LangGraph Agent와 제출 근거 닫기

Day 5는 기존 10~12단계를 묶는다. 새 기능을 무작정 늘리기보다 Day 4의 RAG/MCP를 Agent에 연결하고, 테스트와 제출 문서를 닫는다.

### Day 5-A. LangGraph Agent

#### 목표

RAG와 MCP tool을 선택해 최종 답변을 만드는 Agent workflow를 만든다.

#### 먼저 갱신할 문서

- `docs/ai/agent-design.md`

#### 만들 파일 후보

- `backend/app/ai/agent/state.py`
- `backend/app/ai/agent/tools.py`
- `backend/app/ai/agent/graph.py`
- `backend/app/ai/agent/service.py`
- `backend/app/models/agent_run.py`
- `backend/app/models/agent_step.py`
- `backend/app/schemas/agent.py`
- `backend/app/api/routes/agent.py`
- `frontend/src/api/agent.ts`
- `frontend/src/components/AgentPanel.tsx`
- `frontend/src/components/AgentStepList.tsx`
- `frontend/src/components/AgentAnswer.tsx`
- `frontend/src/components/AgentSourceList.tsx`
- `frontend/src/components/ToolResultCard.tsx`

#### 먼저 배울 개념

- Agent state
- graph node
- conditional edge
- tool call
- max step guard
- trace
- SSE progress

#### 완료 기준

- `StateGraph`가 실제 코드에 있다.
- Agent state가 steps와 tool_calls를 기록한다.
- max_steps를 넘으면 안전하게 종료한다.
- frontend에서 Agent trace 또는 progress가 보인다.

### Day 5-B. 테스트와 제출 정리

#### 목표

핵심 기능이 깨지지 않게 테스트하고 README에 제출 근거를 정리한다.

#### 볼 문서

- `docs/testing/test-plan.md`
- `docs/retrospective/limitations-and-improvements.md`

#### 만들 파일 후보

- `backend/tests/`
- `frontend/src/**/*.test.tsx`
- `frontend/e2e/`
- `README.md`

#### 먼저 배울 개념

- pytest fixture
- test database
- React Testing Library
- Vitest
- Playwright E2E
- manual demo checklist
- known limitations

#### 완료 기준

- auth, posts, owner permission 테스트가 있다.
- frontend 핵심 상태 테스트가 있다.
- 최소 E2E happy path가 있다.
- README에 기능, 실행 명령, 구현 위치, 한계가 정리되어 있다.

### Day 5-C. 회고와 남은 학습 반영

#### 목표

구현 중 남은 위험, 남은 학습 주제, 제출 후 개선 방향을 정리한다.

#### 갱신할 파일

- `docs/retrospective/limitations-and-improvements.md`
- `README.md`

#### 완료 기준

- 구현하지 못한 부분이 숨겨지지 않는다.
- 요구사항을 줄이지 않고 한계와 개선 방향을 기록한다.
- 다음 학습 순서가 남아 있다.

### Day 5 전체 완료 기준

- Day 1~4 기능이 유지되고 RAG/MCP가 단독으로 동작한다.
- Agent가 RAG와 MCP tool을 실제로 호출한다.
- 테스트, README, 데모 스크립트, 한계/개선점 정리가 끝난다.
