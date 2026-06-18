# JungleLog API 설계 문서

이 문서는 React mock UI에서 실제 FastAPI API로 전환하면서 프론트엔드와 백엔드가 공유해야 하는 API 계약을 정리한다.

## 공통 규칙

### Base URL

```txt
local: http://localhost:8000
```

### 인증 방식

- Google OAuth 로그인 성공 후 JungleLog 서버가 자체 JWT access token과 refresh token을 발급한다.
- token은 HttpOnly cookie로 저장한다.
- 보호 API는 FastAPI dependency에서 현재 사용자와 승인 상태를 확인한다.

### 권한 기준

| 역할 | 의미 |
| --- | --- |
| STUDENT | 학습 기록 작성, 포트폴리오 관리, 코치 리뷰 요청 |
| COACH | 학생 기록 조회, 코치 리뷰 인박스 처리 |
| ADMIN | 사용자 승인, 전체 관리 |

### 상태 코드

| Status | 의미 | 예시 |
| --- | --- | --- |
| 200 | 조회/수정 성공 | 목록 조회, 상세 조회, 수정 |
| 201 | 생성 성공 | 게시글 작성, 댓글 작성, 리뷰 요청 생성 |
| 204 | 응답 본문 없는 성공 | 삭제 성공 |
| 400 | 잘못된 요청 | 빈 제목, 취소 불가 상태 취소 시도 |
| 401 | 인증 필요 | 로그인하지 않은 사용자 |
| 403 | 권한 없음 | 학생이 관리자 API 접근 |
| 404 | 리소스 없음 | 없는 게시글 id |
| 422 | 요청 검증 실패 | query/body 타입 불일치 |
| 500 | 서버 오류 | 예상하지 못한 서버 문제 |

### 응답 필드 스타일

- DB/SQLAlchemy 내부는 `snake_case`를 사용한다.
- API response는 React 화면과 맞추기 위해 `camelCase`를 사용한다.

예:

```txt
is_public   -> isPublic
created_at  -> createdAt
view_count  -> views
```

## 인증 API

### GET /auth/google/login

Google OAuth 로그인 화면으로 redirect한다.

### GET /auth/google/callback

Google이 돌려준 authorization code를 받아 사용자 정보를 조회하고 JungleLog token cookie를 설정한다.

처리 흐름:

1. Google token endpoint에 code를 보내 access token을 받는다.
2. Google userinfo endpoint에서 `sub`, `email`, `name`, `picture`를 가져온다.
3. `google_sub` 또는 verified email로 users row를 찾는다.
4. 없으면 승인 대기 사용자로 생성한다.
5. `ADMIN_EMAILS`에 포함된 이메일이면 최고관리자로 유지한다.
6. access/refresh token을 HttpOnly cookie로 내려준다.

### GET /auth/me

현재 로그인 사용자를 반환한다.

응답 예시:

```json
{
  "id": 1,
  "email": "student@example.com",
  "name": "이준희",
  "profileImageUrl": "https://...",
  "role": "STUDENT",
  "approvalStatus": "승인 완료"
}
```

### POST /auth/refresh

refresh token cookie를 검증하고 access token을 재발급한다.

### POST /auth/logout

refresh token을 폐기하고 인증 cookie를 제거한다.

## 게시글 API

### GET /posts

공개 게시글 목록을 페이지 단위로 조회한다.

Query:

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| category | string | 카테고리 slug |
| keyword | string | 제목, 요약, 본문, 작성자, 태그 검색어 |
| page | int | 1부터 시작 |
| size | int | 1~50 |

응답 예시:

```json
{
  "items": [
    {
      "id": 1,
      "title": "FastAPI JWT 인증 구현 기록",
      "summary": "Google OAuth 이후 자체 JWT를 발급하는 흐름",
      "category": "학습 로그",
      "categorySlug": "learning-log",
      "tags": ["FastAPI", "JWT"],
      "author": "이준희",
      "authorRole": "STUDENT",
      "isPublic": true,
      "views": 12,
      "comments": 2,
      "createdAt": "2026-06-13T00:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### GET /posts/{post_id}

게시글 상세를 조회한다.

- 공개글은 비로그인 사용자도 조회 가능하다.
- 비공개글은 작성자 또는 ADMIN만 조회 가능하다.

### POST /posts

게시글을 작성한다.

권한:

- STUDENT
- ADMIN

Body:

```json
{
  "title": "게시글 제목",
  "summary": "게시글 요약",
  "content": "본문",
  "categorySlug": "learning-log",
  "tags": ["FastAPI", "JWT"],
  "isPublic": true,
  "relatedCommit": "abc123"
}
```

작성자는 request body로 받지 않고 JWT의 current user에서 결정한다.

### PATCH /posts/{post_id}

게시글을 수정한다.

권한:

- 작성자
- ADMIN

### DELETE /posts/{post_id}

게시글을 soft delete한다. 실제 row는 삭제하지 않고 `deleted_at`을 기록한다.

## 내 기록 API

### GET /me/posts

현재 로그인 사용자가 작성한 게시글 목록을 조회한다.

Query:

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| category | string | 카테고리 slug |
| keyword | string | 검색어 |
| visibility | all/public/private | 공개 범위 필터 |
| page | int | 1부터 시작 |
| size | int | 최대 50 |

## 댓글 API

### GET /posts/{post_id}/comments

특정 게시글의 댓글 목록을 조회한다.

### POST /posts/{post_id}/comments

댓글을 작성한다.

권한:

- 승인 완료 사용자

Body:

```json
{
  "content": "댓글 내용"
}
```

작성자는 JWT current user에서 결정한다.

### DELETE /comments/{comment_id}

댓글을 soft delete한다.

권한:

- 댓글 작성자
- ADMIN

## 관리자 API

### GET /admin/users

사용자 승인 목록을 조회한다.

권한:

- ADMIN

Query:

| 이름 | 설명 |
| --- | --- |
| approvalStatus | 승인 대기, 승인 완료, 정지, 거절 |
| role | STUDENT, COACH, ADMIN |
| keyword | 이름, 이메일, 역할, 승인 상태 검색 |
| page | 페이지 번호 |
| size | 페이지 크기 |

### PATCH /admin/users/{user_id}

사용자 역할과 승인 상태를 변경한다.

Body:

```json
{
  "role": "COACH",
  "approvalStatus": "승인 완료",
  "approvalNote": "코치 계정 승인"
}
```

중요 규칙:

- ADMIN만 호출할 수 있다.
- `.env`의 `ADMIN_EMAILS`에 포함된 최고관리자는 role/status 변경을 거부한다.
- 변경 이력은 `user_approval_logs`에 저장한다.

## 포트폴리오 API

### GET /portfolio/projects

현재 사용자의 포트폴리오 프로젝트 목록을 조회한다.

### POST /portfolio/projects

GitHub repo URL 또는 branch URL로 프로젝트를 등록한다.

Body:

```json
{
  "githubUrl": "https://github.com/owner/repo/tree/branch-name"
}
```

처리 기준:

- URL에서 `owner/repo`와 branch를 분리한다.
- branch가 없으면 GitHub default branch를 사용한다.
- 같은 사용자에게 같은 `repo + branch`가 중복 등록되지 않게 한다.

### PATCH /portfolio/projects/{project_id}

포트폴리오 상태, 포트폴리오 글, 면접 예상 질문 등을 저장한다.

Body 예시:

```json
{
  "portfolioStatus": "작성중",
  "savedPortfolioDraft": "포트폴리오 글",
  "savedInterviewQuestions": "면접 예상 질문"
}
```

### PUT /portfolio/projects/{project_id}/posts

포트폴리오 프로젝트와 내 기록 게시글을 연결한다.

Body:

```json
{
  "postIds": [1, 2, 3]
}
```

### POST /portfolio/projects/{project_id}/github/refresh

등록된 GitHub repo/branch 기준으로 README, 언어, 커밋 메시지를 다시 수집한다.

### POST /portfolio/projects/{project_id}/publish-post

포트폴리오 프로젝트 내용을 `포트폴리오 관리` 카테고리 게시글로 발행하거나 갱신한다.

Body:

```json
{
  "isPublic": true
}
```

응답에는 발행 결과가 포함된다.

```json
{
  "publishStatus": "created"
}
```

`publishStatus` 값:

| 값 | 의미 |
| --- | --- |
| created | 처음 발행됨 |
| updated | 기존 게시글이 갱신됨 |
| unchanged | 기존 게시글과 내용이 같아 갱신하지 않음 |

## 코치 리뷰 API

### POST /review-requests

학생이 본인의 게시글 또는 포트폴리오 프로젝트에 대해 코치 리뷰를 요청한다.

권한:

- STUDENT
- ADMIN

Body:

```json
{
  "targetType": "post",
  "targetId": 1,
  "coachIds": [2, 3],
  "message": "리뷰 부탁드립니다."
}
```

### GET /review-requests/me

학생이 자신이 보낸 리뷰 요청 목록을 조회한다.

### GET /review-requests/inbox

코치가 자신에게 들어온 리뷰 요청 목록을 조회한다. ADMIN은 전체 요청을 볼 수 있다.

### PATCH /review-requests/{id}

코치가 리뷰 요청 상태와 피드백을 갱신한다.

Body:

```json
{
  "status": "피드백 완료",
  "feedback": "구현 흐름은 좋고 README 근거를 조금 더 보강하면 좋겠습니다."
}
```

상태 값:

- 대기 중
- 검토 중
- 수정 요청
- 피드백 완료

### DELETE /review-requests/{id}

학생이 아직 `대기 중`인 요청을 취소한다. 검토가 시작된 요청은 취소할 수 없다.

## AI/RAG/MCP/Agent API

AI 기능은 OpenAI 직접 생성, RAG 검색 기반 생성, MCP-like JSON-RPC tool, Agent tool loop로 나누어 구현한다.

구현 endpoint:

```txt
POST /ai/generate
POST /ai/rag/index
POST /ai/rag/search
POST /mcp
POST /ai/agent/run
```

연결 구조:

- OpenAI: 포트폴리오 프로젝트 자료를 prompt로 구성해 포트폴리오 글 또는 면접 예상 질문을 생성
- RAG: README 원문, GitHub 커밋 메시지, JungleLog 게시글을 검색 근거로 사용
- MCP: GitHub repo 또는 포트폴리오 프로젝트 정보를 도구 형태로 조회
- Agent: 프로젝트 조회, RAG 검색, 생성 도구를 제한된 loop로 실행

# 2026-06-17 AI/RAG/MCP/Agent API 추가

## AI Generate

```txt
POST /ai/generate
```

Request:

```json
{
  "project_id": 1,
  "output_type": "portfolio",
  "generation_mode": "direct"
}
```

`generation_mode`:

- `direct`: 프로젝트 자료를 직접 prompt에 넣는다.
- `rag`: RAG 검색 context를 추가한다.
- `agent`: 현재 `/ai/generate`에서는 direct로 fallback하고, 실제 agent loop는 `/ai/agent/run`을 사용한다.

## RAG

```txt
POST /ai/rag/index
POST /ai/rag/search
```

RAG는 프로젝트별 README, commit message, 연결 기록을 `rag_documents`에 저장하고 검색한다.

## MCP

```txt
POST /mcp
```

JSON-RPC 2.0 endpoint다.

지원 method:

- `mcp.list_tools`
- `mcp.call_tool`

지원 tool:

- `get_github_repository`
- `get_portfolio_project`

## Agent

```txt
POST /ai/agent/run
```

Agent는 `get_portfolio_project -> rag_search -> generate_project_content` 순서로 tool loop를 실행한다.
