
## 2026-06-15 API ?? ????: ?? ?? ??

### GET /review-requests/coaches

?? ??? COACH ??? ??? ????.

### POST /review-requests

??? ??? ?? ????? ????? ?? ??? ????.

Body:

```json
{
  "targetType": "post",
  "targetId": 1,
  "coachIds": [2, 3],
  "message": "?? ??????."
}
```

### GET /review-requests/me

?? ??? ?? ?? ?? ??? ????.

### GET /review-requests/inbox

?? ???? ??? ?? ?? ??? ????. ADMIN? ?? ??? ? ? ??.

### PATCH /review-requests/{id}

??? ?? ?? ADMIN? ??? ???? ????.

Body:

```json
{
  "status": "??? ??",
  "feedback": "?? ??? ? ????."
}
```

### DELETE /review-requests/{id}

??? ?? `?? ?`? ??? ????. ??? ??? ??? 400?? ???.

---

## 2026-06-15 API ?? ????: ????? ????

### GET /portfolio/projects

?? ??? ???? ????? ???? ??? ????.

### POST /portfolio/projects

GitHub repo URL? ????? ????.

Body:

```json
{
  "githubUrl": "https://github.com/owner/repo",
  "techStack": ["FastAPI", "React"]
}
```

??? `githubUrl`?? `owner/repo`? ??? `repoFullName`?? ????.

### PATCH /portfolio/projects/{project_id}

???? ?? ??? ????.

Body ??:

```json
{
  "portfolioStatus": "?? ??",
  "savedPortfolioDraft": "????? ??"
}
```

### PUT /portfolio/projects/{project_id}/posts

????? ??? ??? ??? ????.

Body:

```json
{
  "postIds": [1, 2, 3]
}
```

??? ?? ???? ??? ? ??.

---

## 2026-06-15 API ?? ????: ADMIN ??? ?? ??

### GET /admin/users

??? ?? ??? ?? API?.

Query:

- `approvalStatus`: ??, `?? ??` / `?? ??` / `??` / `??`
- `role`: ??, `STUDENT` / `COACH` / `ADMIN`
- `keyword`: ??, ??/???/??/?? ?? ??
- `page`: ?? 1
- `size`: ?? 100, ?? 100

Response item:

- `id`
- `email`
- `name`
- `profileImageUrl`
- `role`
- `approvalStatus`
- `approvalNote`
- `requestedAt`
- `approvedAt`
- `approvedBy`
- `lastLoginAt`

### PATCH /admin/users/{user_id}

??? ?? ??? ??/?? ?? ?? API?.

Body:

```json
{
  "role": "COACH",
  "approvalStatus": "?? ??",
  "approvalNote": "??? ??"
}
```

??:

- ADMIN? ??? ? ??.
- ?? ??? ADMIN ??? ????? ??? ? ??.
- ?? ??? `users` ???? ????.
- ?? ??? `user_approval_logs`? ????.

---

## 2026-06-15 API ?? ????: current_user ???/?? ??

### ?? ??

- ??? ??? HttpOnly cookie? access token?? ??.
- ?? API? `get_current_user` ?? `get_current_approved_user`? ????.
- ?? ?? API? `require_roles(...)`? ????.
- ?? ?? API? `get_optional_current_user`? ??? ????? ????, ??? ???? ??? ?? ??? ????.

### ??? API ??

| API | ?? | ?? |
| --- | --- | --- |
| `GET /posts` | ?? | ?? ??? ??? ?? |
| `GET /posts/{post_id}` | ?? + optional auth | ???? ??, ????? ???/ADMIN |
| `POST /posts` | STUDENT, ADMIN | ?? ??? ???? ???? ?? |
| `PATCH /posts/{post_id}` | ???, ADMIN | ??? ?? ?? ADMIN? ?? |
| `DELETE /posts/{post_id}` | ???, ADMIN | soft delete |
| `GET /me/posts` | ?? ?? ??? | ?? ??? ???? ?? ?? |

### ?? API ??

| API | ?? | ?? |
| --- | --- | --- |
| `GET /posts/{post_id}/comments` | ?? + optional auth | ??? ??? ??, ???? ??? ???/ADMIN |
| `POST /posts/{post_id}/comments` | ?? ?? ??? | ?? ??? ???? ?? ???? ?? |
| `DELETE /comments/{comment_id}` | ?? ???, ADMIN | ?? soft delete |

### ?? ?? ??

??? ??/?? ??? `authorId`? ????.

?? ??? `authorId`? ????.

? ?? ????? ??/?? ??? ???? ???? ? ????. ?, ??? ?? ??? UX?? ?? ??? ??? service?? ?? ????.

---
# JungleLog API Design

## 2026-06-14 추가: GET /me/posts

내 기록 화면용 게시글 목록 API가 구현되었습니다. `GET /posts`는 공개 게시글 전체 목록이고, `GET /me/posts`는 현재 로그인 사용자가 작성한 글 목록입니다.

현재는 JWT/OAuth2 연결 전이므로 백엔드가 `demo.student@junglelog.local` 사용자를 현재 사용자처럼 사용합니다.

### Request

```http
GET /me/posts?category=learning-log&keyword=JWT&visibility=all&page=1&size=50
```

### Query

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `category` | string | 아니오 | `learning-log`, `troubleshooting` 같은 카테고리 slug |
| `keyword` | string | 아니오 | 제목, 요약, 본문, 태그, 카테고리 검색어 |
| `visibility` | `all` \| `public` \| `private` | 아니오 | 공개/비공개 필터. 기본값은 `all` |
| `page` | int | 아니오 | 1부터 시작 |
| `size` | int | 아니오 | 1~50 |

### Response 200

`PostListResponse`와 같은 구조를 사용합니다.

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
  "size": 50
}
```

### JWT/OAuth2 후 변경 예정

- demo user 조회를 제거하고 JWT에서 얻은 `current_user.id`로 조회합니다.
- 비공개 글 상세 조회는 작성자 본인 또는 ADMIN만 가능하게 보호합니다.
- `/my-records`에서 비공개 글 클릭 시 내 글 상세 API 또는 권한 기반 상세 API로 연결합니다.

## 2026-06-14 추가: DELETE /comments/{comment_id}

댓글 삭제 API가 구현되었습니다. 현재는 JWT/OAuth2 연결 전이므로 작성자 권한 검사는 아직 붙이지 않았고, 존재하는 댓글을 soft delete 처리합니다.

### Request

```http
DELETE /comments/3
```

### Response 204

성공 시 응답 본문이 없습니다.

```txt
HTTP 204 No Content
```

### Error

- `404`: 댓글 id가 없거나 이미 삭제되어 조회 대상이 아님
- `422`: `comment_id`가 정수가 아닌 경우 FastAPI path parameter 검증 실패

### 동작 기준

- 실제 row를 지우는 hard delete가 아니라 `comments.deleted_at`에 삭제 시각을 기록합니다.
- `GET /posts/{post_id}/comments`는 `comments.deleted_at is null` 조건을 사용하므로 삭제된 댓글은 사용자에게 보이지 않습니다.
- 댓글 삭제 후 게시글 상세 화면에서는 해당 댓글을 local state에서 제거해 바로 사라진 것처럼 보여줍니다.

### JWT/OAuth2 후 변경 예정

- `current_user.id == comment.author_id` 또는 `current_user.role == ADMIN`일 때만 삭제 가능하게 바꿉니다.
- 삭제 권한이 없으면 `403 Forbidden`을 반환합니다.

## 2026-06-14 추가: DELETE /posts/{post_id}

게시글 삭제 API가 구현되었습니다. 현재는 JWT/OAuth2 연결 전이므로 작성자 권한 검사는 아직 붙이지 않았고, 존재하는 게시글을 soft delete 처리합니다.

### Request

```http
DELETE /posts/8
```

### Response 204

성공 시 응답 본문이 없습니다.

```txt
HTTP 204 No Content
```

### Error

- `404`: 게시글 id가 없거나 이미 삭제되어 조회 대상이 아님
- `422`: `post_id`가 정수가 아닌 경우 FastAPI path parameter 검증 실패

### 동작 기준

- 실제 row를 지우는 hard delete가 아니라 `posts.deleted_at`에 삭제 시각을 기록합니다.
- `GET /posts`, `GET /posts/{post_id}`, `GET /posts/{post_id}/comments`는 `deleted_at is null` 조건을 사용하므로 삭제된 글은 사용자에게 보이지 않습니다.
- 댓글, 코치 리뷰 요청, 포트폴리오 연결 이력을 보존하기 위해 v1에서는 soft delete를 사용합니다.

### JWT/OAuth2 후 변경 예정

- `current_user.id == post.author_id` 또는 `current_user.role == ADMIN`일 때만 삭제 가능하게 바꿉니다.
- 삭제 권한이 없으면 `403 Forbidden`을 반환합니다.
- 삭제 이력 감사 로그를 남길지 검토합니다.

## 2026-06-14 추가: PATCH /posts/{post_id}

게시글 수정 API가 구현되었습니다. 현재는 JWT/OAuth2 전 단계라 작성자 권한 검사는 아직 붙지 않았고, 화면에서 전달한 전체 수정 폼 값을 받아 게시글을 갱신합니다.

### Request

```http
PATCH /posts/5
Content-Type: application/json
```

```json
{
  "title": "api patch flow updated",
  "summary": "updated summary",
  "content": "updated content",
  "categorySlug": "troubleshooting",
  "tags": ["FastAPI", "UpdateAPI"],
  "isPublic": true,
  "relatedCommit": "updated-commit"
}
```

### Response 200

```json
{
  "id": 5,
  "title": "api patch flow updated",
  "summary": "updated summary",
  "category": "트러블슈팅",
  "categorySlug": "troubleshooting",
  "tags": ["FastAPI", "UpdateAPI"],
  "author": "정글 학생",
  "authorRole": "STUDENT",
  "isPublic": true,
  "views": 0,
  "comments": 0,
  "createdAt": "2026-06-14T00:00:00Z",
  "content": "updated content",
  "relatedCommit": "updated-commit",
  "updatedAt": "2026-06-14T00:00:00Z"
}
```

### Error

- `400`: 제목이나 본문이 공백
- `404`: 게시글 id가 없거나 `categorySlug`에 맞는 카테고리가 없음
- `422`: request body 타입 또는 필수 필드 검증 실패

### JWT/OAuth2 후 변경 예정

- 현재는 demo user 단계라 수정 권한 검사를 하지 않습니다.
- 인증 구현 후에는 `post.author_id == current_user.id` 또는 `current_user.role == ADMIN`인 경우에만 수정 가능하게 바꿉니다.
- 비공개 글 수정은 작성자 본인/관리자에게만 허용합니다.

## 2026-06-14 추가: POST /posts

게시글 작성 API가 구현되었습니다. JWT/OAuth2 전 단계이므로 request body에는 작성자 id를 받지 않고, 백엔드에서 `demo.student@junglelog.local` seed 사용자를 임시 작성자로 사용합니다.

### Request

```http
POST /posts
Content-Type: application/json
```

```json
{
  "title": "post create api test",
  "summary": "post create api summary",
  "content": "post create api content",
  "categorySlug": "learning-log",
  "tags": ["FastAPI", "CreateAPI"],
  "isPublic": true,
  "relatedCommit": "api-create-post-test"
}
```

### Response 201

```json
{
  "id": 4,
  "title": "post create api test",
  "summary": "post create api summary",
  "category": "학습 로그",
  "categorySlug": "learning-log",
  "tags": ["FastAPI", "CreateAPI"],
  "author": "정글 학생",
  "authorRole": "STUDENT",
  "isPublic": true,
  "views": 0,
  "comments": 0,
  "createdAt": "2026-06-13T15:22:22.516377Z",
  "content": "post create api content",
  "relatedCommit": "api-create-post-test",
  "updatedAt": "2026-06-13T15:22:22.516377Z"
}
```

### Error

- `400`: 제목이나 본문이 공백
- `404`: `categorySlug`에 맞는 카테고리가 없음
- `500`: JWT 전 단계에서 사용할 demo user가 seed 되어 있지 않음

### JWT/OAuth2 후 변경 예정

- 작성자 정보는 request body가 아니라 JWT token의 current user에서 가져옵니다.
- 비공개 글 조회 권한, 작성자 본인 수정/삭제 권한은 인증 구현 후 연결합니다.

## 2026-06-13 추가: POST /posts/{post_id}/comments

댓글 작성 API가 구현되었습니다. JWT/OAuth2 전 단계이므로 request body에는 댓글 본문만 받고, 작성자는 백엔드에서 `demo.student@junglelog.local` seed 사용자로 임시 처리합니다.

### Request

```http
POST /posts/1/comments
Content-Type: application/json
```

```json
{
  "content": "댓글 내용"
}
```

### Response 201

```json
{
  "id": 1,
  "postId": 1,
  "author": "정글 학생",
  "authorRole": "STUDENT",
  "content": "댓글 내용",
  "createdAt": "2026-06-13T15:02:09.995708Z",
  "updatedAt": "2026-06-13T15:02:09.995708Z"
}
```

### Error

- `400`: 공백만 있는 댓글
- `404`: 댓글을 달 게시글이 없음
- `500`: JWT 전 단계에서 사용할 demo user가 seed 되어 있지 않음

### JWT/OAuth2 후 변경 예정

- 작성자 정보는 request body가 아니라 JWT token의 current user에서 가져옵니다.
- 본인 댓글 삭제, 코치/관리자 권한 처리는 인증 구현 후 추가합니다.

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

상태: 구현 완료

필요한 인증:

- 작성자 본인
- ADMIN

현재 인증 전 단계에서는 demo 흐름으로 동작하며, 실제 작성자/관리자 권한 검사는 JWT/OAuth2 이후 추가한다.

### DELETE /posts/{post_id}

게시글을 삭제한다.

상태: 백엔드 연결 후 구현 예정

실제 삭제가 아니라 `deleted_at`을 채우는 soft delete 방식을 사용한다.

## 4. 댓글 API

### GET /posts/{post_id}/comments

게시글 댓글 목록을 조회한다.

상태: 구현 완료

Request path:

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| post_id | int | 댓글을 조회할 게시글 id |

Response:

```json
{
  "postId": 1,
  "items": [
    {
      "id": 1,
      "postId": 1,
      "author": "정글 학생",
      "authorRole": "STUDENT",
      "content": "댓글 내용",
      "createdAt": "2026-06-13T00:00:00",
      "updatedAt": "2026-06-13T00:00:00"
    }
  ],
  "total": 1
}
```

게시글은 존재하지만 댓글이 없으면 빈 배열을 반환한다.

```json
{
  "postId": 1,
  "items": [],
  "total": 0
}
```

없는 게시글 id이면 404를 반환한다.

```json
{
  "detail": "게시글을 찾을 수 없습니다."
}
```

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
