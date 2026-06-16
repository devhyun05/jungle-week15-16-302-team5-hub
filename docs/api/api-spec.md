# API Spec

## 1. 공통 규칙

### Base URL

```txt
/api
```

모든 API는 `/api` prefix를 기준으로 작성한다.

예시:

```txt
GET /api/products
GET /api/products/{product_id}
POST /api/auth/logout
```

---

## 2. 인증 규칙

API의 인증 여부는 다음 기준을 따른다.

| 인증 타입     | 의미                                                                                 |
| ------------- | ------------------------------------------------------------------------------------ |
| 불필요        | 로그인하지 않아도 접근 가능                                                          |
| 선택          | 로그인 여부와 상관없이 접근 가능하지만, 로그인 상태라면 사용자 정보를 활용할 수 있음 |
| 필요          | 로그인한 사용자만 접근 가능                                                          |
| 작성자        | 해당 리소스를 작성한 사용자만 접근 가능                                              |
| 작성자/관리자 | 작성자 또는 관리자만 접근 가능                                                       |

---

## 3. 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {}
}
```

### 실패 응답

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

---

## 4. Auth API

### 4.1 Slack 로그인 시작

```txt
GET /api/auth/slack/login
```

Slack OAuth 로그인을 시작한다.

#### 인증

불필요

#### 사용 위치

`Login.tsx`의 `Slack으로 계속하기` 버튼

#### Response

Slack 인증 페이지로 redirect된다.

---

### 4.2 Slack OAuth Callback

```txt
GET /api/auth/slack/callback
```

Slack 승인 후 자동으로 호출되는 백엔드 route이다.

#### 인증

불필요

#### 설명

Slack에서 전달한 인증 정보를 이용해 로그인 처리를 진행한다.

#### Response

로그인 성공 후 프론트엔드 페이지로 redirect된다.

---

### 4.3 내 정보 조회

```txt
GET /api/auth/me
```

현재 로그인한 사용자의 정보를 조회한다.

#### 인증

필요

#### 사용 위치

- Header
- Profile
- RequireAuth
- 새로고침 시 로그인 유지 확인

#### Response

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "홍길동",
    "email": "user@example.com",
    "profile_image_url": "https://example.com/profile.png"
  }
}
```

---

### 4.4 로그아웃

```txt
POST /api/auth/logout
```

현재 로그인한 사용자를 로그아웃 처리한다.

#### 인증

필요

#### 사용 위치

Header 프로필 드롭다운의 로그아웃 버튼

#### Response

```json
{
  "success": true,
  "data": null
}
```

---

## 5. Products API

### 5.1 상품 목록 조회

```txt
GET /api/products
```

홈 화면에 표시할 상품 목록을 조회한다.

#### 인증

선택

#### Query Parameters

| 이름        | 타입   | 필수 여부 | 설명             |
| ----------- | ------ | --------- | ---------------- |
| category_id | number | 선택      | 카테고리 필터    |
| keyword     | string | 선택      | 검색어           |
| page        | number | 선택      | 페이지 번호      |
| size        | number | 선택      | 한 페이지당 개수 |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "title": "키보드 팝니다",
      "price": 30000,
      "status": "ON_SALE",
      "thumbnail_url": "https://example.com/image.png",
      "category": {
        "category_id": 1,
        "name": "전자기기"
      },
      "seller": {
        "user_id": 1,
        "name": "홍길동"
      },
      "created_at": "2026-06-11T12:00:00"
    }
  ]
}
```

---

### 5.2 상품 상세 조회

```txt
GET /api/products/{product_id}
```

특정 상품의 상세 정보를 조회한다.

#### 인증

선택

#### Path Parameters

| 이름       | 타입   | 설명    |
| ---------- | ------ | ------- |
| product_id | number | 상품 ID |

#### Response

```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "title": "키보드 팝니다",
    "description": "상태 좋은 키보드입니다.",
    "price": 30000,
    "status": "ON_SALE",
    "images": [
      {
        "image_id": 1,
        "image_url": "https://example.com/image.png"
      }
    ],
    "category": {
      "category_id": 1,
      "name": "전자기기"
    },
    "seller": {
      "user_id": 1,
      "name": "홍길동",
      "profile_image_url": "https://example.com/profile.png"
    },
    "created_at": "2026-06-11T12:00:00",
    "updated_at": "2026-06-11T12:00:00"
  }
}
```

---

### 5.3 상품 등록

```txt
POST /api/products
```

새 판매글을 작성한다.

#### 인증

필요

#### Request Body

```json
{
  "title": "키보드 팝니다",
  "description": "상태 좋은 키보드입니다.",
  "price": 30000,
  "category_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "product_id": 1
  }
}
```

---

### 5.4 상품 수정

```txt
PATCH /api/products/{product_id}
```

판매글 내용을 수정한다.

#### 인증

작성자

#### Request Body

```json
{
  "title": "키보드 팝니다",
  "description": "가격 인하합니다.",
  "price": 25000,
  "category_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "product_id": 1
  }
}
```

---

### 5.5 상품 삭제

```txt
DELETE /api/products/{product_id}
```

판매글을 삭제한다.

#### 인증

작성자

#### Response

```json
{
  "success": true,
  "data": null
}
```

---

### 5.6 상품 상태 변경

```txt
PATCH /api/products/{product_id}/status
```

상품의 판매 상태만 변경한다.

#### 인증

작성자

#### Request Body

```json
{
  "status": "SOLD_OUT"
}
```

#### status 값

| 값       | 의미     |
| -------- | -------- |
| ON_SALE  | 판매중   |
| RESERVED | 예약중   |
| SOLD_OUT | 판매완료 |

#### Response

```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "status": "SOLD_OUT"
  }
}
```

---

## 6. Categories API

### 6.1 카테고리 목록 조회

```txt
GET /api/categories
```

카테고리 목록을 조회한다.

#### 인증

불필요

#### 설명

카테고리를 API로 불러오면 프론트엔드에서 카테고리를 하드코딩하지 않아도 된다.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "name": "전자기기"
    },
    {
      "category_id": 2,
      "name": "도서"
    }
  ]
}
```

---

## 7. Comments API

### 7.1 댓글 조회

```txt
GET /api/products/{product_id}/comments
```

특정 상품에 달린 댓글 목록을 조회한다.

#### 인증

선택

#### Response

```json
{
  "success": true,
  "data": [
    {
      "comment_id": 1,
      "content": "아직 판매 중인가요?",
      "writer": {
        "user_id": 2,
        "name": "김철수",
        "profile_image_url": "https://example.com/profile.png"
      },
      "created_at": "2026-06-11T12:00:00",
      "updated_at": "2026-06-11T12:00:00"
    }
  ]
}
```

---

### 7.2 댓글 작성

```txt
POST /api/products/{product_id}/comments
```

특정 상품에 새 댓글을 작성한다.

#### 인증

필요

#### Request Body

```json
{
  "content": "아직 판매 중인가요?"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "comment_id": 1
  }
}
```

---

### 7.3 댓글 수정

```txt
PATCH /api/comments/{comment_id}
```

내가 작성한 댓글 내용을 수정한다.

#### 인증

작성자

#### Request Body

```json
{
  "content": "오늘 거래 가능할까요?"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "comment_id": 1
  }
}
```

---

### 7.4 댓글 삭제

```txt
DELETE /api/comments/{comment_id}
```

내가 작성한 댓글 또는 관리자가 댓글을 삭제한다.

#### 인증

작성자/관리자

#### Response

```json
{
  "success": true,
  "data": null
}
```

---

## 8. Profile API

### 8.1 내 프로필 조회

```txt
GET /api/users/me
```

내 프로필 정보를 조회한다.

#### 인증

필요

#### Response

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "홍길동",
    "email": "user@example.com",
    "profile_image_url": "https://example.com/profile.png",
    "created_at": "2026-06-11T12:00:00"
  }
}
```

---

### 8.2 내 프로필 수정

```txt
PATCH /api/users/me
```

내 프로필 정보를 수정한다.

#### 인증

필요

#### Request Body

```json
{
  "name": "새로운 이름"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "새로운 이름"
  }
}
```

---

### 8.3 내 작성글 조회

```txt
GET /api/users/me/products
```

내가 작성한 판매글 목록을 조회한다.

#### 인증

필요

#### Response

```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "title": "키보드 팝니다",
      "price": 30000,
      "status": "ON_SALE",
      "thumbnail_url": "https://example.com/image.png",
      "created_at": "2026-06-11T12:00:00"
    }
  ]
}
```

---

### 8.4 내 댓글 내역 조회

```txt
GET /api/users/me/comments
```

내가 작성한 댓글 내역을 조회한다.

#### 인증

필요

#### Response

```json
{
  "success": true,
  "data": [
    {
      "comment_id": 1,
      "content": "아직 판매 중인가요?",
      "product": {
        "product_id": 1,
        "title": "키보드 팝니다"
      },
      "created_at": "2026-06-11T12:00:00"
    }
  ]
}
```

---

## 9. Images API

### 9.1 상품 이미지 업로드

```txt
POST /api/products/{product_id}/images
```

상품 이미지를 업로드한다.

#### 인증

작성자

#### Request

`multipart/form-data` 형식으로 이미지를 전송한다.

| 이름  | 타입 | 설명                 |
| ----- | ---- | -------------------- |
| image | File | 업로드할 상품 이미지 |

#### Response

```json
{
  "success": true,
  "data": {
    "image_id": 1,
    "image_url": "https://example.com/image.png"
  }
}
```

---

### 9.2 상품 이미지 삭제

```txt
DELETE /api/product-images/{image_id}
```

상품 이미지를 삭제한다.

#### 인증

작성자

#### Response

```json
{
  "success": true,
  "data": null
}
```

---

### 9.3 프로필 이미지 업로드

```txt
POST /api/users/me/profile-image
```

프로필 이미지를 업로드한다.

#### 인증

필요

#### Request

`multipart/form-data` 형식으로 이미지를 전송한다.

| 이름  | 타입 | 설명                   |
| ----- | ---- | ---------------------- |
| image | File | 업로드할 프로필 이미지 |

#### Response

```json
{
  "success": true,
  "data": {
    "profile_image_url": "https://example.com/profile.png"
  }
}
```

---

## 10. AI API

AI API는 RAG, MCP, AI Agent 기능을 제공한다.

MVP에서는 AI 기능을 기존 중고거래 기능과 분리해서 `/api/ai` prefix 아래에 둔다.

### 10.1 유사 상품 추천

```txt
GET /api/ai/products/{product_id}/similar
```

특정 상품과 유사한 상품을 RAG 기반으로 추천한다.

#### 분류

RAG

#### 인증

선택

#### 사용 위치

- 상품 상세 페이지의 유사 상품 영역
- 상품 작성 중 중복 게시글 확인

#### Path Parameters

| 이름       | 타입   | 설명    |
| ---------- | ------ | ------- |
| product_id | number | 상품 ID |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "product_id": 2,
      "title": "무선 키보드 판매합니다",
      "price": 25000,
      "similarity": 0.87,
      "reason": "제목과 설명에서 키보드, 무선, 사용감 키워드가 유사합니다."
    }
  ]
}
```

---

### 10.2 중복 상품 감지

```txt
POST /api/ai/products/duplicate-check
```

상품 등록 또는 수정 전에 기존 상품과 내용이 너무 비슷한지 확인한다.

#### 분류

RAG

#### 인증

필요

#### 사용 위치

- 상품 등록 페이지
- 상품 수정 페이지

#### Request Body

```json
{
  "title": "키보드 팝니다",
  "description": "상태 좋은 무선 키보드입니다.",
  "price": 30000
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "is_duplicate_like": true,
    "matched_products": [
      {
        "product_id": 3,
        "title": "무선 키보드 판매",
        "similarity": 0.91
      }
    ]
  }
}
```

---

### 10.3 AI 글쓰기 도움

```txt
POST /api/ai/products/draft-assist
```

사용자가 입력한 상품 정보를 바탕으로 판매글 문장을 다듬거나 태그를 추천한다.

#### 분류

AI Agent

#### 인증

필요

#### 사용 위치

- 상품 등록 페이지
- 상품 수정 페이지

#### Request Body

```json
{
  "title": "맥북 팔아요",
  "description": "조금 썼고 상태 괜찮아요",
  "action": "improve_text"
}
```

#### action 값

| 값            | 의미        |
| ------------- | ----------- |
| improve_text  | 문장 다듬기 |
| fix_typo      | 오타 수정   |
| suggest_tags  | 태그 추천   |

#### Response

```json
{
  "success": true,
  "data": {
    "title": "맥북 판매합니다",
    "description": "사용감은 조금 있지만 전체적으로 상태가 좋은 맥북입니다.",
    "suggested_tags": ["노트북", "맥북", "전자기기"],
    "ai_log_id": 1
  }
}
```

---

### 10.4 게시글 기반 Q&A

```txt
POST /api/ai/rag/ask
```

게시글, 댓글, 운영 문서 등 내부 데이터를 기반으로 질문에 답변한다.

#### 분류

RAG

#### 인증

필요

#### 사용 위치

- AI Q&A 화면
- 상품 탐색 보조 기능

#### Request Body

```json
{
  "question": "최근에 올라온 모니터 중 10만원 이하 상품이 있어?"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "answer": "최근 등록된 상품 중 10만원 이하 모니터가 2개 있습니다.",
    "references": [
      {
        "source_type": "product",
        "source_id": 7,
        "title": "24인치 모니터 판매"
      }
    ],
    "ai_log_id": 2
  }
}
```

---

### 10.5 MCP 도구 호출

```txt
POST /api/ai/mcp/tools/{tool_name}/call
```

AI 기능에서 필요한 외부 도구를 MCP를 통해 호출한다.

#### 분류

MCP

#### 인증

필요

#### 사용 위치

- Slack 알림 전송
- 외부 URL 메타데이터 조회
- S3 이미지 정보 확인

#### Path Parameters

| 이름      | 타입   | 설명                  |
| --------- | ------ | --------------------- |
| tool_name | string | 호출할 MCP tool 이름  |

#### Request Body

```json
{
  "payload": {
    "url": "https://example.com"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "tool_name": "fetch_url_metadata",
    "result": {
      "title": "Example Domain",
      "description": "Example page description"
    },
    "mcp_tool_call_id": 1
  }
}
```

---

### 10.6 Agent 실행 시작

```txt
POST /api/ai/agent-runs
```

사용자의 목표를 받아 AI Agent 실행을 시작한다.

#### 분류

AI Agent

#### 인증

필요

#### 사용 위치

- AI 글쓰기 도우미
- 신고 검토 보조
- 상품 등록 자동 보조

#### Request Body

```json
{
  "goal": "이 상품 설명을 더 신뢰감 있게 다듬고 적절한 태그를 추천해줘.",
  "post_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "agent_run_id": 1,
    "status": "running"
  }
}
```

---

### 10.7 Agent 실행 조회

```txt
GET /api/ai/agent-runs/{agent_run_id}
```

AI Agent 실행 상태와 결과를 조회한다.

#### 분류

AI Agent

#### 인증

필요

#### Path Parameters

| 이름         | 타입   | 설명          |
| ------------ | ------ | ------------- |
| agent_run_id | number | Agent 실행 ID |

#### Response

```json
{
  "success": true,
  "data": {
    "agent_run_id": 1,
    "status": "success",
    "final_answer": "상품 설명을 더 구체적으로 다듬었습니다.",
    "steps": [
      {
        "step_order": 1,
        "action_type": "rag_search",
        "status": "success"
      },
      {
        "step_order": 2,
        "action_type": "llm",
        "status": "success"
      }
    ]
  }
}
```

---

### 10.8 AI 로그 조회

```txt
GET /api/ai/logs
```

내가 실행한 AI 기능 로그를 조회한다.

#### 분류

AI Log

#### 인증

필요

#### Query Parameters

| 이름         | 타입   | 필수 여부 | 설명                         |
| ------------ | ------ | --------- | ---------------------------- |
| feature_type | string | 선택      | AI 기능 종류                 |
| page         | number | 선택      | 페이지 번호                  |
| size         | number | 선택      | 한 페이지당 개수             |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "ai_log_id": 1,
      "feature_type": "draft_assist",
      "status": "success",
      "created_at": "2026-06-15T12:00:00"
    }
  ]
}
```

---

## 11. Status Code

| Status Code               | 의미                  |
| ------------------------- | --------------------- |
| 200 OK                    | 조회, 수정, 삭제 성공 |
| 201 Created               | 생성 성공             |
| 400 Bad Request           | 잘못된 요청           |
| 401 Unauthorized          | 로그인 필요           |
| 403 Forbidden             | 권한 없음             |
| 404 Not Found             | 리소스를 찾을 수 없음 |
| 409 Conflict              | 중복 또는 충돌        |
| 500 Internal Server Error | 서버 에러             |

---

## 12. 에러 응답 예시

### 로그인하지 않은 경우

```json
{
  "success": false,
  "message": "로그인이 필요합니다."
}
```

### 권한이 없는 경우

```json
{
  "success": false,
  "message": "권한이 없습니다."
}
```

### 존재하지 않는 상품인 경우

```json
{
  "success": false,
  "message": "상품을 찾을 수 없습니다."
}
```
