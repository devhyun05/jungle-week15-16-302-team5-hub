# API Spec

## Purpose

이 문서는 frontend와 backend 사이의 약속을 정리한다. 실제 구현이 바뀌면 이 문서도 같이 갱신한다.

## 작성 방법

각 API는 아래 항목을 반드시 가진다.

- Method
- Path
- Auth required 여부
- Request body 또는 query params
- Response shape
- Error status
- 구현 파일 위치

## Common Response Rules

### Error Shape

```json
{
  "detail": "Human readable error message",
  "code": "optional_machine_code"
}
```

### Pagination Shape

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 20,
  "total_pages": 0
}
```

## Auth APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/auth/signup` | no | email, display_name, password | user | 400, 409, 422 |
| POST | `/auth/login` | no | email, password | access_token, user | 400, 401, 422 |
| POST | `/auth/logout` | yes | none | success | 401 |
| GET | `/auth/me` | yes | none | user | 401 |

## Post APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/posts` | yes | title, body, board, tags, source_url? | post | 401, 422 |
| GET | `/posts` | optional | q?, tag?, board?, page?, size? | paginated posts | 400 |
| GET | `/posts/{post_id}` | optional | none | post detail | 404 |
| PUT | `/posts/{post_id}` | owner | title?, body?, tags? | post | 401, 403, 404, 422 |
| DELETE | `/posts/{post_id}` | owner | none | success | 401, 403, 404 |
| GET | `/posts/{post_id}/similar` | optional | limit? | similar posts | 404 |

## Comment APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/posts/{post_id}/comments` | yes | body, original_language? | comment | 401, 404, 422 |
| GET | `/posts/{post_id}/comments` | optional | page?, size? | paginated comments | 404 |
| DELETE | `/comments/{comment_id}` | owner | none | success | 401, 403, 404 |

## Tag APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/tags` | optional | q? | tags | 400 |
| POST | `/tags` | yes | name | tag | 401, 409, 422 |

## AI APIs

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/ai/rag-answer` | yes | question, post_id? | answer, sources | 401, 422, 503 |
| POST | `/ai/source-metadata` | yes | url | metadata | 401, 422, 503 |
| POST | `/ai/agent` | yes | question, post_id?, max_steps? | final_answer, tool_calls | 401, 422, 503 |
| GET | `/ai/agent/{run_id}/events` | yes | none | SSE stream | 401, 404 |

## GraphQL

| Method | Path | Auth | Query | Response | Error |
|---|---|---|---|---|---|
| POST | `/graphql` | optional | posts, post | GraphQL response | GraphQL errors |

Example query:

```graphql
query Posts($page: Int, $size: Int) {
  posts(page: $page, size: $size) {
    items {
      id
      title
      board
    }
    total
  }
}
```

## SSR

| Method | Path | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/preview/posts/{post_id}` | optional | none | HTML | 404 |

SSR implementation can be a FastAPI `HTMLResponse` that returns a public topic preview.

## Realtime APIs

| Type | Path | Auth | Purpose | Events |
|---|---|---|---|---|
| WebSocket | `/ws/topics/{post_id}` | optional | comment/activity demo | `connected`, `message` |
| SSE | `/events/ai/{run_id}` | yes | AI progress | `progress`, `tool_call`, `done`, `error` |

## MCP JSON-RPC Shape

FastAPI may call the MCP server through HTTP or local process call. The payload must follow JSON-RPC 2.0.

Request:

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "tools.call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "city": "Seoul"
    }
  }
}
```

Success response:

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "result": {
    "temperature": 23.1,
    "summary": "Clear"
  }
}
```

Error response:

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "error": {
    "code": -32602,
    "message": "Invalid params"
  }
}
```

## Daily Update Checklist

- [ ] 새 endpoint를 구현하면 이 문서에 추가한다.
- [ ] request/response shape가 바뀌면 frontend type과 함께 수정한다.
- [ ] 401/403/404/422/500 계열 error를 빠뜨리지 않는다.
- [ ] README 요구사항 구현 위치 표에 endpoint를 연결한다.


## Day 1 MVP API Contract

Day 1에서는 auth와 posts CRUD만 먼저 구현한다.
댓글, 태그, 검색, 페이징, AI API는 Day 2 이후에 확장한다.

| Method | Path | Auth | Purpose | Request | Response | Error |
|---|---|---|---|---|---|---|
| POST | `/api/auth/signup` | no | 회원가입 | email, display_name, password | user | 409, 422 |
| POST | `/api/auth/login` | no | 로그인 | email, password | access_token, user | 401, 422 |
| GET | `/api/auth/me` | yes | 현재 사용자 확인 | none | user | 401 |
| GET | `/api/posts` | no | 게시글 목록 조회 | none | post[] | none |
| POST | `/api/posts` | yes | 게시글 작성 | title, body | post | 401, 422 |
| GET | `/api/posts/{post_id}` | no | 게시글 상세 조회 | path: post_id | post | 404 |
| PUT | `/api/posts/{post_id}` | owner | 게시글 수정 | path: post_id, body: title?, body? | post | 401, 403, 404, 422 |
| DELETE | `/api/posts/{post_id}` | owner | 게시글 삭제 | path: post_id | success | 401, 403, 404 |