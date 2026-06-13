# JungleLog API Design

이 문서는 React mock UI를 실제 FastAPI API로 바꾸기 전에 프론트엔드와 백엔드가 공유할 API 계약을 정리한다.

## 1. API 설계의 목적

API 설계는 "프론트가 어떤 요청을 보내고, 백엔드가 어떤 JSON을 돌려줄지"를 미리 정하는 작업이다.

JungleLog에서는 다음 순서로 구현한다.

1. 게시글 조회 API
2. 게시글 작성/수정/삭제 API
3. 댓글 API
4. Google OAuth / JWT 인증 API
5. 관리자 승인 API
6. 포트폴리오 프로젝트 API
7. 코치 리뷰 요청 API
8. GitHub / RAG / MCP / Agent API

이번 4단계 1차 구현 범위는 게시글 조회 API다.

## 2. 공통 규칙

### Base URL

```txt
local: http://127.0.0.1:8000
```

### JSON naming

DB와 SQLAlchemy model은 Python 스타일인 `snake_case`를 사용한다.
프론트엔드 응답 JSON은 React mock data와 연결하기 쉽게 일부 필드를 화면 친화적인 이름으로 내려준다.

예시:

```txt
DB column       API response
is_public   -> isPublic
view_count  -> views
created_at  -> createdAt
```

### Pagination

목록 API는 기본적으로 `page`, `size`, `total`, `items`를 사용한다.

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 10
}
```

### Error response

FastAPI 기본 오류 응답을 먼저 사용한다.
공통 예외 형식은 인증과 CRUD가 안정화된 뒤 `core/exceptions.py`에서 정리한다.

```json
{
  "detail": "게시글을 찾을 수 없습니다."
}
```

### HTTP status code

| Status | 의미 | JungleLog 예시 |
| --- | --- | --- |
| 200 | 조회 성공 | 게시글 목록/상세 조회 |
| 201 | 생성 성공 | 게시글 작성, 댓글 작성 |
| 204 | 응답 본문 없는 성공 | 게시글 삭제, 댓글 삭제 |
| 400 | 잘못된 요청 | 잘못된 입력값 |
| 401 | 로그인 필요 | JWT 없음 |
| 403 | 권한 없음 | 학생이 관리자 API 접근 |
| 404 | 리소스 없음 | 없는 게시글 id 조회 |
| 422 | 검증 실패 | Pydantic validation 실패 |
| 500 | 서버 오류 | 예상하지 못한 서버 문제 |

## 3. 게시글 API

### GET /posts

게시글 목록을 조회한다.

현재 v1에서는 인증 전 단계이므로 공개 게시글 중심으로 조회한다.
나중에 JWT가 붙으면 `내 기록`은 `GET /me/posts` 또는 `GET /posts?mine=true`로 분리할 수 있다.

Request query:

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| category | string | 아니오 | `learning-log`, `troubleshooting` 같은 카테고리 slug |
| keyword | string | 아니오 | 제목, 요약, 본문, 작성자, 카테고리, 태그 검색어 |
| page | int | 아니오 | 1부터 시작 |
| size | int | 아니오 | 한 페이지 개수 |

Response:

```json
{
  "items": [
    {
      "id": 1,
      "title": "FastAPI JWT 인증 구현 기록",
      "summary": "Google OAuth 이후 자체 JWT를 발급하는 흐름 정리",
      "category": "학습 로그",
      "categorySlug": "learning-log",
      "tags": ["FastAPI", "JWT", "OAuth2"],
      "author": "정글 학생",
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

Request path:

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| post_id | int | 게시글 id |

Response:

```json
{
  "id": 1,
  "title": "FastAPI JWT 인증 구현 기록",
  "summary": "Google OAuth 이후 자체 JWT를 발급하는 흐름 정리",
  "content": "본문 내용",
  "category": "학습 로그",
  "categorySlug": "learning-log",
  "tags": ["FastAPI", "JWT", "OAuth2"],
  "author": "정글 학생",
  "authorRole": "STUDENT",
  "isPublic": true,
  "views": 12,
  "comments": 2,
  "relatedCommit": "abc1234",
  "createdAt": "2026-06-13T00:00:00",
  "updatedAt": "2026-06-13T00:00:00"
}
```

Not found:

```txt
HTTP 404
```

```json
{
  "detail": "게시글을 찾을 수 없습니다."
}
```

### POST /posts

게시글을 작성한다.

상태: 백엔드 연결 후 구현 예정

필요한 인증:

- STUDENT
- ADMIN

### PATCH /posts/{post_id}

게시글을 수정한다.

상태: 백엔드 연결 후 구현 예정

필요한 인증:

- 작성자 본인
- ADMIN

### DELETE /posts/{post_id}

게시글을 삭제한다.

상태: 백엔드 연결 후 구현 예정

실제 삭제가 아니라 `deleted_at`을 채우는 soft delete 방식을 사용한다.

## 4. 댓글 API

### GET /posts/{post_id}/comments

게시글 댓글 목록을 조회한다.

상태: 백엔드 연결 후 구현 예정

### POST /posts/{post_id}/comments

게시글 댓글을 작성한다.

상태: 백엔드 연결 후 구현 예정

### DELETE /comments/{comment_id}

댓글을 삭제한다.

상태: 백엔드 연결 후 구현 예정

## 5. 인증/승인 API

### Google OAuth / JWT

상태: 5단계에서 구현 예정

예정 endpoint:

```txt
GET /auth/google/login
GET /auth/google/callback
GET /auth/me
POST /auth/logout
```

### 관리자 승인 API

상태: Google OAuth / JWT 이후 구현 예정

예정 endpoint:

```txt
GET /admin/users
PATCH /admin/users/{user_id}/approval
```

## 6. 포트폴리오 API

상태: 게시글 CRUD와 인증 이후 구현 예정

예정 endpoint:

```txt
GET /portfolio-projects
POST /portfolio-projects
GET /portfolio-projects/{project_id}
PATCH /portfolio-projects/{project_id}
POST /portfolio-projects/{project_id}/posts
DELETE /portfolio-projects/{project_id}/posts/{post_id}
```

## 7. 코치 리뷰 API

상태: 인증 이후 구현 예정

예정 endpoint:

```txt
GET /review-requests
POST /review-requests
PATCH /review-requests/{request_id}
DELETE /review-requests/{request_id}
```

역할별 의미:

- STUDENT: 본인이 보낸 요청만 조회
- COACH: 본인에게 배정된 요청만 조회
- ADMIN: 전체 요청 조회

## 8. AI API

상태: 기본 게시판/포트폴리오 저장 흐름 이후 구현 예정

예정 endpoint:

```txt
POST /ai/portfolio-draft
POST /ai/interview-questions
POST /ai/rag/search
POST /mcp/github/analyze
POST /agent/run
```

역할:

- RAG: JungleLog 게시글과 포트폴리오 기록 검색
- MCP: GitHub 같은 외부 시스템 호출
- Agent: 필요한 도구를 선택하고 실행하는 추론 루프

## 9. 4단계 1차 완료 기준

- `GET /posts` API 설계가 문서화되어 있다.
- `GET /posts/{post_id}` API 설계가 문서화되어 있다.
- 게시글 응답 Pydantic schema가 있다.
- 게시글 repository/service/router 흐름이 있다.
- Swagger `/docs`에서 posts API가 보인다.
- 없는 게시글 id는 404를 반환한다.
- `python -m compileall app`이 성공한다.
- `npm run build`가 성공한다.
