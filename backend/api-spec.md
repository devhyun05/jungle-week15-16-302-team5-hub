# 말랑 연구소 Backend API 설계서

## 1. 설계 기준

- 현재 프로젝트는 기본 게시판 기능과 AI 보조 기능을 최소 범위로 구현한다.
- DB 저장 대상은 `users`, `posts`, `comments`, `tags`, `post_tags`, `embeddings`다.
- MCP 상품 검색 결과와 Agent 답변은 DB에 저장하지 않고 요청 시 API 응답으로만 반환한다.
- 별도 RAG 페이지와 별도 MCP 페이지는 없고, 프론트의 `/agent` 화면에서 AI API를 호출한다.

## 2. 공통 규칙

### Base URL

로컬 개발 기준:

```text
http://localhost:8000
```

### Content-Type

요청과 응답은 기본적으로 JSON을 사용한다.

```http
Content-Type: application/json
```

### 인증 헤더

로그인이 필요한 API는 JWT access token을 Bearer token으로 전달한다.

```http
Authorization: Bearer {access_token}
```

### 공통 에러 응답

FastAPI 기본 에러 형식을 따른다.

```json
{
  "detail": "에러 메시지"
}
```

주요 상태 코드:

| 상태 코드 | 의미 |
| --- | --- |
| `200 OK` | 조회/수정 성공 |
| `201 Created` | 생성 성공 |
| `204 No Content` | 삭제 성공 |
| `400 Bad Request` | 중복 이메일, 잘못된 입력 등 |
| `401 Unauthorized` | 로그인 필요 또는 토큰 오류 |
| `403 Forbidden` | 작성자 권한 없음 |
| `404 Not Found` | 대상 리소스 없음 |
| `422 Unprocessable Entity` | 요청 body/query 검증 실패 |

## 3. 구현 파일 흐름

```text
app/main.py
  -> router 등록, CORS, health check, startup seed

app/core/config.py
  -> DATABASE_URL, JWT, CORS, MCP 서버 URL 설정

app/db/
  -> SQLAlchemy Base, engine, session dependency

app/models/
  -> users, posts, comments, tags, post_tags
  -> embeddings는 구현 단계에서 embedding.py에 추가

app/schemas/
  -> API request/response Pydantic schema

app/routers/
  -> auth, posts, comments, tags, ai endpoint

app/services/
  -> 인증, 태그, 게시글, RAG, MCP client, Agent route 로직
```

## 4. 도메인 요약

| 도메인 | 주요 DB | 설명 |
| --- | --- | --- |
| Auth | `users` | 회원가입, 로그인, 현재 사용자 조회 |
| Posts | `posts`, `post_tags` | 게시글 CRUD, 검색, 페이징, 태그 연결 |
| Comments | `comments` | 게시글 댓글 CRUD |
| Tags | `tags`, `post_tags` | 태그 목록, 인기 태그 |
| RAG | `embeddings`, `posts`, `comments` | 게시글/댓글 기반 유사 근거 검색 |
| MCP | 없음 | 슬라임 재료 상품 검색 도구 호출 |
| Agent | 없음 | 사용자 요청을 `rag`, `mcp`, `rag+mcp`로 라우팅 |

## 5. Health

### GET `/health`

서버 상태 확인용 API다.

인증: 불필요

응답 `200 OK`

```json
{
  "status": "ok"
}
```

## 6. Auth API

### POST `/auth/signup`

회원가입 API다.

인증: 불필요

요청

```json
{
  "email": "slime@example.com",
  "password": "password123",
  "nickname": "말랑이"
}
```

검증 규칙:

- `email`: 5~255자, 이메일 형식, 중복 불가
- `password`: 8~128자
- `nickname`: 1~80자

응답 `201 Created`

```json
{
  "id": 1,
  "email": "slime@example.com",
  "nickname": "말랑이",
  "created_at": "2026-06-11T10:00:00Z"
}
```

구현 메모:

- 비밀번호는 평문 저장 금지
- `password_hash`에 해시 결과 저장
- 가입 성공 후 토큰을 바로 주지 않고, 현재 구조에서는 로그인 API를 별도로 호출한다

### POST `/auth/login`

로그인 API다.

인증: 불필요

요청

```json
{
  "email": "slime@example.com",
  "password": "password123"
}
```

응답 `200 OK`

```json
{
  "access_token": "jwt.token.value",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "slime@example.com",
    "nickname": "말랑이",
    "created_at": "2026-06-11T10:00:00Z"
  }
}
```

구현 메모:

- 이메일이 없거나 비밀번호 검증 실패 시 `401`
- JWT `sub`에는 user id를 문자열로 저장

### GET `/auth/me`

현재 로그인한 사용자 정보를 조회한다.

인증: 필요

응답 `200 OK`

```json
{
  "id": 1,
  "email": "slime@example.com",
  "nickname": "말랑이",
  "created_at": "2026-06-11T10:00:00Z"
}
```

## 7. Posts API

### 게시글 타입

`post_type`은 아래 값 중 하나다.

| 값 | 의미 | 주 사용 필드 |
| --- | --- | --- |
| `recipe` | 레시피 | `ingredients`, `ratio`, `steps`, `texture_result`, `storage_tip` |
| `failure` | 실패 해결 질문 | `symptom`, `attempted_solution`, `solved_status` |
| `review` | 완성 후기 | `texture_result`, `difficulty`, `slime_type` |
| `general` | 일반 글 | `title`, `content`, `tags` |

### GET `/posts`

게시글 목록을 조회한다.

인증: 선택

Query

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `page` | number | 아니오 | `1` | 페이지 번호 |
| `size` | number | 아니오 | `10` | 페이지 크기, 최대 50 |
| `keyword` | string | 아니오 | 없음 | 제목, 본문, 슬라임 타입, 증상, 태그명 검색 |
| `post_type` | string | 아니오 | 없음 | `recipe`, `failure`, `review`, `general` |
| `tag` | string | 아니오 | 없음 | 태그명 |
| `slime_type` | string | 아니오 | 없음 | 슬라임 종류 |

응답 `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "title": "딸기향 투명 슬라임 만들기",
      "content": "클리어 글루에 향료와 글리터를 먼저 섞습니다.",
      "summary": "클리어 글루에 향료와 글리터를 먼저 섞습니다.",
      "post_type": "recipe",
      "slime_type": "클리어슬라임",
      "difficulty": "초보자추천",
      "tags": ["클리어슬라임", "레시피"],
      "author": {
        "id": 1,
        "email": "slime@example.com",
        "nickname": "말랑이",
        "created_at": "2026-06-11T10:00:00Z"
      },
      "comment_count": 0,
      "is_owner": true,
      "ingredients": "클리어 PVA 글루, 액티베이터, 딸기향 향료",
      "ratio": "글루 100ml 기준 액티베이터 소량",
      "steps": "향료를 섞은 뒤 액티베이터를 나눠 넣습니다.",
      "texture_result": "투명하고 탱글한 질감",
      "storage_tip": "밀폐 용기에 보관",
      "symptom": null,
      "attempted_solution": null,
      "solved_status": null,
      "created_at": "2026-06-11T10:00:00Z",
      "updated_at": "2026-06-11T10:00:00Z"
    }
  ],
  "page": 1,
  "size": 10,
  "total": 1,
  "total_pages": 1
}
```

구현 메모:

- 최신순 `created_at DESC, id DESC`
- 로그인 사용자가 작성자이면 `is_owner=true`
- 인증 없이 조회할 수 있지만 `is_owner`는 false

### POST `/posts`

게시글을 작성한다.

인증: 필요

요청

```json
{
  "title": "딸기향 투명 슬라임 만들기",
  "content": "처음 만드는 사람도 따라할 수 있는 투명 슬라임 레시피입니다.",
  "post_type": "recipe",
  "slime_type": "클리어슬라임",
  "difficulty": "초보자추천",
  "tag_names": ["클리어슬라임", "레시피"],
  "ingredients": "클리어 PVA 글루, 액티베이터, 딸기향 향료",
  "ratio": "글루 100ml 기준 액티베이터 2~3방울씩",
  "steps": "향료와 글리터를 먼저 섞고 액티베이터를 나눠 넣습니다.",
  "texture_result": "탱글하고 투명한 질감",
  "storage_tip": "사용 후 밀폐 용기에 보관",
  "symptom": null,
  "attempted_solution": null,
  "solved_status": null
}
```

응답 `201 Created`

- 응답 body는 `PostResponse`와 동일

구현 메모:

- 작성자는 access token의 현재 사용자
- `tag_names`는 최대 8개까지 정규화
- 게시글 생성 후 RAG 구현 단계에서는 `embeddings` 생성 작업을 연결한다

### GET `/posts/{post_id}`

게시글 상세를 조회한다.

인증: 선택

응답 `200 OK`

- 응답 body는 `PostResponse`와 동일

예외:

- 게시글이 없으면 `404`

### PATCH `/posts/{post_id}`

게시글을 수정한다.

인증: 필요

요청

```json
{
  "title": "딸기향 투명 슬라임 레시피 수정",
  "tag_names": ["클리어슬라임", "향료", "초보자추천"]
}
```

응답 `200 OK`

- 응답 body는 `PostResponse`와 동일

예외:

- 게시글이 없으면 `404`
- 작성자가 아니면 `403`

구현 메모:

- partial update 방식
- `tag_names`가 요청에 포함될 때만 태그 연결을 교체
- 게시글 수정 후 RAG 구현 단계에서는 관련 임베딩을 갱신한다

### DELETE `/posts/{post_id}`

게시글을 삭제한다.

인증: 필요

응답 `204 No Content`

예외:

- 게시글이 없으면 `404`
- 작성자가 아니면 `403`

구현 메모:

- 댓글과 태그 연결은 함께 정리
- RAG 구현 단계에서는 관련 임베딩도 함께 삭제하거나 재색인 대상에 넣는다

## 8. Comments API

### GET `/posts/{post_id}/comments`

게시글 댓글 목록을 조회한다.

인증: 선택

응답 `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "post_id": 1,
      "content": "액티베이터는 한 번에 많이 넣지 않는 게 좋아요.",
      "author": {
        "id": 2,
        "email": "helper@example.com",
        "nickname": "도움이",
        "created_at": "2026-06-11T10:10:00Z"
      },
      "is_owner": false,
      "created_at": "2026-06-11T10:20:00Z",
      "updated_at": "2026-06-11T10:20:00Z"
    }
  ]
}
```

예외:

- 게시글이 없으면 `404`

### POST `/posts/{post_id}/comments`

댓글을 작성한다.

인증: 필요

요청

```json
{
  "content": "액티베이터는 2~3방울씩 나눠 넣어보세요."
}
```

응답 `201 Created`

- 응답 body는 `CommentResponse`와 동일

구현 메모:

- 댓글 생성 후 RAG 구현 단계에서는 댓글 임베딩 생성 작업을 연결한다

### PATCH `/comments/{comment_id}`

댓글을 수정한다.

인증: 필요

요청

```json
{
  "content": "액티베이터는 소량씩 넣고 충분히 치대보세요."
}
```

응답 `200 OK`

- 응답 body는 `CommentResponse`와 동일

예외:

- 댓글이 없으면 `404`
- 작성자가 아니면 `403`

### DELETE `/comments/{comment_id}`

댓글을 삭제한다.

인증: 필요

응답 `204 No Content`

예외:

- 댓글이 없으면 `404`
- 작성자가 아니면 `403`

## 9. Tags API

### GET `/tags`

태그 목록을 조회한다.

인증: 불필요

Query

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `tag_type` | string | 아니오 | `slime_type`, `symptom`, `texture`, `difficulty`, `purpose` |

응답 `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "name": "클리어슬라임",
      "tag_type": "slime_type"
    }
  ]
}
```

구현 메모:

- 개발 단계에서는 startup 또는 최초 조회 시 초기 태그 seed를 보장한다

### GET `/tags/popular`

많이 사용된 태그를 조회한다.

인증: 불필요

Query

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `limit` | number | 아니오 | `12` | 조회할 태그 수 |

응답 `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "name": "클리어슬라임",
      "tag_type": "slime_type",
      "count": 5
    }
  ]
}
```

## 10. AI API

### POST `/ai/rag/search`

내부 게시글/댓글 기반 유사 근거를 검색한다.

인증: 불필요

요청

```json
{
  "query": "투명 슬라임이 너무 끈적여요"
}
```

응답 `200 OK`

```json
{
  "query": "투명 슬라임이 너무 끈적여요",
  "items": [
    {
      "post_id": 1,
      "title": "액티베이터 비율을 잘못 넣었을 때",
      "post_type": "failure",
      "score": 91,
      "excerpt": "액티베이터를 소량씩 추가하고 충분히 치대면 손에 묻는 정도가 줄어듭니다.",
      "tags": ["액티베이터", "끈적임"]
    }
  ]
}
```

구현 메모:

- 1차 구현은 게시글/태그 키워드 검색으로 시작할 수 있다
- RAG 구현 단계에서는 `embeddings`의 pgvector 유사도 검색으로 교체한다

### POST `/ai/products/search`

MCP 상품 검색 도구를 호출해 슬라임 재료 구매 후보를 반환한다.

인증: 불필요

요청

```json
{
  "query": "딸기향 투명 슬라임 만들 재료랑 액티베이터 구매처 알려줘"
}
```

응답 `200 OK`

```json
{
  "query": "딸기향 투명 슬라임 만들 재료랑 액티베이터 구매처 알려줘",
  "inferred_materials": ["클리어 PVA 글루", "슬라임 액티베이터", "딸기향 향료"],
  "items": [
    {
      "material": "슬라임 액티베이터",
      "search_keyword": "슬라임 액티베이터 붕사수",
      "estimated_price": "3,000원 ~ 7,000원",
      "source": "mock-shopping-adapter",
      "link": "https://search.shopping.naver.com/search/all?query=슬라임+액티베이터+붕사수"
    }
  ],
  "adapter": "mcp-style-product-search"
}
```

구현 메모:

- 백엔드는 MCP Server에 JSON-RPC로 요청한다
- MCP 서버 장애 시 demo fallback을 둘 수 있다
- 결과는 DB에 저장하지 않는다

### POST `/ai/agent/route`

사용자 요청을 분석해 RAG, MCP, 또는 둘 다 호출할지 결정하고 결과를 통합한다.

인증: 불필요

요청

```json
{
  "message": "딸기향 투명 슬라임 만드는 법이랑 액티베이터 구매처 알려줘"
}
```

응답 `200 OK`

```json
{
  "route": "rag+mcp",
  "tool_calls": ["rag.search_internal_posts", "mcp.search_products"],
  "answer": "제작 순서는 RAG 결과를 따르고, 구매 목록은 MCP 상품 검색 결과를 참고하세요.",
  "rag": {
    "query": "딸기향 투명 슬라임 만드는 법이랑 액티베이터 구매처 알려줘",
    "items": [
      {
        "post_id": 1,
        "title": "딸기향 투명 슬라임 기본 제작 순서",
        "post_type": "recipe",
        "score": 86,
        "excerpt": "클리어 글루 베이스에 향료와 글리터를 먼저 섞습니다.",
        "tags": ["클리어슬라임", "향료", "레시피"]
      }
    ]
  },
  "products": {
    "query": "딸기향 투명 슬라임 만드는 법이랑 액티베이터 구매처 알려줘",
    "inferred_materials": ["클리어 PVA 글루", "슬라임 액티베이터", "딸기향 향료"],
    "items": [
      {
        "material": "슬라임 액티베이터",
        "search_keyword": "슬라임 액티베이터 붕사수",
        "estimated_price": "3,000원 ~ 7,000원",
        "source": "mock-shopping-adapter",
        "link": "https://search.shopping.naver.com/search/all?query=슬라임+액티베이터+붕사수"
      }
    ],
    "adapter": "mcp-style-product-search"
  },
  "recommended_tags": ["AI도움", "클리어슬라임", "재료구매", "상품검색"]
}
```

`route` 값:

| 값 | 설명 |
| --- | --- |
| `rag` | 내부 게시글/댓글 근거만 필요 |
| `mcp` | 상품 검색 도구만 필요 |
| `rag+mcp` | 제작법/문제 해결 근거와 구매처가 모두 필요 |

구현 메모:

- Agent 응답은 DB에 저장하지 않는다
- 추천 태그는 화면 표시용이며, 사용자가 게시글 작성 시 선택해서 저장하는 흐름은 추후 확장한다

## 11. 구현 순서 제안

1. `core/config.py`, `db/session.py`, `main.py`로 FastAPI 앱과 DB 연결을 확인한다.
2. `users` 모델, Auth schema, Auth router/service를 구현한다.
3. `tags`, `post_tags` 모델과 초기 태그 seed를 구현한다.
4. `posts` 모델, schema, CRUD API를 구현한다.
5. 게시글 목록 검색, 태그 필터, 페이징을 구현한다.
6. `comments` 모델, schema, CRUD API를 구현한다.
7. 게시글/댓글 생성 후 임베딩 생성 hook 위치를 잡는다.
8. `embeddings` 모델과 `embedding_service`, `rag_service`를 구현한다.
9. MCP Server와 연결되는 `mcp_client`를 구현한다.
10. `/ai/agent/route`에서 RAG/MCP 호출 흐름을 조합한다.
11. 프론트 화면별 API 호출을 점검한다.

## 12. 프론트 연결 기준

현재 프론트에서 호출하는 API는 아래와 같다.

| 화면 | API |
| --- | --- |
| 회원가입 | `POST /auth/signup` |
| 로그인 | `POST /auth/login` |
| 게시글 목록 | `GET /posts`, `GET /tags`, `GET /tags/popular` |
| 게시글 작성 | `POST /posts` |
| 게시글 상세 | `GET /posts/{post_id}`, `GET /posts/{post_id}/comments` |
| 댓글 작성 | `POST /posts/{post_id}/comments` |
| 게시글 수정 | `PATCH /posts/{post_id}` |
| 게시글 삭제 | `DELETE /posts/{post_id}` |
| Agent | `POST /ai/agent/route` |

## 13. 추후 확장 후보

- 이미지/영상 업로드
- 좋아요, 북마크, 마이페이지
- 개인 레시피북
- 실제 쇼핑 API 연동
- 실제 결제 또는 구매 대행
