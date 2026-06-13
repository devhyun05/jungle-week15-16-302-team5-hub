# Troubleshooting

## 2026-06-14 FastAPI TestClient 실행 시 httpx/httpx2 의존성 오류

### 증상

게시글 수정 API QA를 FastAPI `TestClient`로 실행하려고 했을 때 아래 오류가 발생했다.

```txt
RuntimeError: The starlette.testclient module requires the httpx2 package to be installed.
```

### 원인

현재 `backend/.venv`에 Starlette/FastAPI 테스트 클라이언트가 요구하는 HTTP 테스트 의존성이 설치되어 있지 않았다. 기능 코드 문제라기보다는 자동 테스트 도구를 실행하기 위한 패키지 준비가 부족한 상태다.

### 해결 / 우회

이번 단계에서는 새 패키지를 설치하지 않고, 실행 중인 로컬 FastAPI 서버에 `Invoke-RestMethod`로 실제 HTTP 요청을 보내 검증했다.

검증한 흐름:

```txt
POST /posts
-> PATCH /posts/{created_id}
-> GET /posts/{created_id}
-> PATCH /posts/999999999 404 확인
-> 공백 제목 PATCH 400 확인
```

### 나중에 다시 볼 부분

자동화 테스트를 본격적으로 도입할 때 `httpx` 또는 현재 Starlette 버전에 맞는 테스트 의존성을 `requirements.txt`에 추가할지 결정한다.

## 2026-06-13 PowerShell API 테스트에서 한글 댓글이 깨져 보임

### 증상

PowerShell `Invoke-RestMethod`로 `POST /posts/1/comments`를 테스트할 때 한글 응답이 깨져 보였다.

```txt
author: ì ê¸ íì
content: API ?? QA ?????
```

### 원인

FastAPI/DB 로직 문제가 아니라 PowerShell 콘솔 출력 인코딩과 명령 문자열 전달 과정에서 한글이 깨진 것이다. 특히 Codex shell을 통해 PowerShell 명령을 전달할 때 한글 body를 직접 넣으면 깨져 저장될 수도 있다.

### 해결 / 우회

- API 기능 검증용 body는 `comment api test`처럼 ASCII 문자열을 쓰면 안전하다.
- 한글 표시를 확인하고 싶으면 Swagger UI나 브라우저에서 직접 입력해 확인한다.
- PowerShell에서 직접 작업할 때는 UTF-8 출력 설정을 먼저 확인한다.

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

### 이번 결론

댓글 작성 API 자체는 `201`, 목록 조회, `400`, `404` QA를 통과했다. 다만 PowerShell 테스트 데이터에 한글을 직접 넣을 때는 인코딩에 주의한다.

이 문서는 JungleLog 구현 중 실제로 발견한 문제와 해결 과정을 기록한다.
`test.md`는 반복 검증을 위한 QA 체크리스트로 사용하고, 이 문서는 검증 중 발견된 문제의 원인과 해결 내용을 남긴다.

## 작성 규칙

각 문제는 아래 형식으로 기록한다.

```txt
## 날짜 - 문제 제목

- 영역:
- 증상:
- 원인:
- 해결:
- 다시 확인할 것:
- 관련 파일:
```

## 2026-06-10 - 헤더 전역 검색 UI가 동작하지 않음

- 영역: 프론트엔드 공통 레이아웃
- 증상: `MainLayout` 헤더에 검색창이 보였지만 입력해도 검색 결과나 라우트 이동이 없었다.
- 원인: 검색어 state, submit handler, `navigate`, 검색 결과 화면 연결이 없었다.
- 해결: 현재 단계에서는 페이지별 검색만 유지하고, 동작하지 않는 헤더 전역 검색 UI와 unused import를 제거했다.
- 다시 확인할 것: 전역 검색을 다시 만들 때는 `/posts?keyword=...` 라우트 이동 또는 검색 API 연결을 먼저 설계한다.
- 관련 파일: `frontend/src/app/layouts/MainLayout.tsx`

## 2026-06-10 - 문서 구조가 중복 안내 파일 때문에 헷갈림

- 영역: 문서 구조
- 증상: 루트 `LOG.md`, `docs/code.md`, `docs/study.md`가 실제 문서가 아니라 이동 안내 파일이라 초반에 헷갈릴 수 있었다.
- 원인: 실제 운영 문서는 `docs/agent`에 있는데 안내 파일이 여러 위치에 남아 있었다.
- 해결: 중복 안내 파일을 제거하고, `docs/agent` 안의 핵심 문서 중심으로 정리했다.
- 다시 확인할 것: README와 `agent.md`가 현재 문서 구조를 정확히 가리키는지 확인한다.
- 관련 파일: `docs/agent/agent.md`, `docs/agent/study.md`

## 2026-06-11 - CoachReview 학생/코치 요청 state가 분리됨

- 영역: 프론트엔드 코치 리뷰
- 증상: 코치가 피드백과 상태를 변경해도 학생의 내가 보낸 요청 목록과 자연스럽게 이어지지 않았다.
- 원인: `StudentReviewView`와 `CoachInboxView`가 각각 다른 `requests` state를 가지고 있었다.
- 해결: `requests` state를 부모 `CoachReview`로 끌어올리고, 학생과 코치 화면에 props로 전달했다.
- 다시 확인할 것: 학생은 `requesterId`, 코치는 `coachIds` 기준으로 같은 원본 state를 필터링해서 보는지 확인한다.
- 관련 파일: `frontend/src/app/pages/coach/CoachReview.tsx`

## 2026-06-11 - FastAPI CORS 옵션 오타

- 영역: 백엔드 FastAPI 기본 설정
- 증상: `/health` 요청 시 500 Internal Server Error가 발생했다.
- 원인: `CORSMiddleware` 옵션을 `allow_methos`로 잘못 작성했다. 올바른 이름은 `allow_methods`다.
- 해결: `allow_methos`를 `allow_methods`로 수정했다.
- 다시 확인할 것: 서버 실행 후 `/health`가 HTTP 200으로 응답하는지 확인한다.
- 관련 파일: `backend/app/main.py`

## 2026-06-11 - `/health` 실제 응답과 Swagger schema 불일치

- 영역: 백엔드 라우터 구조
- 증상: Swagger 문서에는 `status`, `service`가 보였지만 실제 `/health` 응답은 `{"status":"ok"}`만 나왔다.
- 원인: `main.py`에 직접 등록한 `@app.get("/health")`와 `routers/health.py`의 `/health` router가 중복 등록되어 있었다.
- 해결: `main.py`의 직접 `/health` endpoint를 제거하고, `app.include_router(health_router)`로 router만 등록하도록 정리한다.
- 다시 확인할 것: `/docs`에 `/health`가 의도한 schema로 보이고, 실제 `/health` 응답도 schema와 일치하는지 확인한다.
- 관련 파일: `backend/app/main.py`, `backend/app/routers/health.py`

## 2026-06-12 - Google mock 로그인과 관리자 승인 흐름이 정책과 어긋남

- 영역: 프론트엔드 인증/권한 mock UI
- 증상: Google mock 로그인 버튼이 `/`로 바로 이동해 신규 사용자가 승인 대기 없이 서비스에 들어가는 것처럼 보였다. 관리자 승인 화면에서는 role select 변경이 `승인 적용` 버튼을 누르기 전에도 화면의 role 값에 바로 반영되어, 버튼의 의미가 애매했다.
- 원인: mock 로그인 버튼이 단순 `Link`였고, 관리자 화면의 select가 `users` state를 즉시 수정하고 있었다.
- 해결: Google mock 로그인 클릭 시 `localStorage`에 `STUDENT / 승인 대기`를 저장하고 `/pending-approval`로 이동하도록 수정했다. 관리자 화면은 `roleDrafts` state를 추가해 select 값은 임시로 들고 있다가 `승인 적용`에서 role과 `승인 완료` 상태를 함께 반영하도록 정리했다.
- 다시 확인할 것: 실제 Google OAuth 구현 시 callback에서 신규 사용자는 `STUDENT / 승인 대기`, `ADMIN_EMAILS` 사용자는 `ADMIN / 승인 완료`로 생성되는지 확인한다.
- 관련 파일: `frontend/src/app/pages/auth/Login.tsx`, `frontend/src/app/pages/admin/AdminUsers.tsx`, `frontend/src/app/components/RoleGate.tsx`

## 2026-06-12 - 화면 mock 필드 일부가 DB 설계에 직접 대응되지 않음

- 영역: DB 설계 / 화면 데이터 매핑
- 증상: React mock 화면에서 `MockPost.relatedCommit`, `PortfolioProject.summary`를 사용하고 있었지만 ERD v1 DBML에는 직접 저장할 컬럼이 없었다.
- 원인: 화면 mock data를 먼저 만들고 나중에 DB 설계를 하면서, 화면 표시용 필드와 실제 저장 필드의 대응 관계를 끝까지 대조하지 않았다.
- 해결: `posts.related_commit text`, `portfolio_projects.summary text`를 DBML에 추가했다. `contentSections`는 v1에서 `posts.content text`에 Markdown/본문 문자열로 저장하기로 문서화했다.
- 다시 확인할 것: SQLAlchemy model 작성 시 위 두 컬럼이 빠지지 않는지 확인한다. `comments` 수, `linkedRecordCount`, `requesterName`, `coachNames`, `targetTitle`은 컬럼으로 만들지 않고 JOIN/count로 만드는지 확인한다.
- 관련 파일: `docs/agent/db-design.md`, `docs/agent/test.md`, `frontend/src/app/data/mockData.ts`
## 2026-06-13 FastAPI TestClient 실행 실패

### 상황

4단계 게시글 조회 API를 검증하기 위해 `fastapi.testclient.TestClient`를 사용하려고 했다.

### 에러

```txt
RuntimeError: The starlette.testclient module requires the httpx2 package to be installed.
```

현재 백엔드 가상환경에는 `httpx` 또는 `httpx2` 테스트 의존성이 설치되어 있지 않았다.

### 원인

`TestClient`는 내부적으로 HTTP client 패키지를 필요로 한다.
현재 프로젝트는 실제 서버 실행에 필요한 FastAPI/Uvicorn 중심으로 설치되어 있고, 테스트 클라이언트 의존성은 아직 추가하지 않았다.

### 임시 해결

테스트 의존성을 바로 늘리지 않고, 임시 uvicorn 서버를 `127.0.0.1:8010`에 띄운 뒤 PowerShell `Invoke-RestMethod`로 실제 HTTP 요청을 보내 검증했다.

확인한 항목:

- `GET /posts`
- `GET /posts/{post_id}`
- `GET /posts?category=learning-log`
- `GET /posts?keyword=JWT`
- `GET /posts/999999`

### 이후 개선

백엔드 테스트 단계를 시작할 때 `httpx` 또는 현재 Starlette 버전에 맞는 테스트 의존성을 명시적으로 추가하고, `pytest` 기반 API 테스트를 만든다.

## 2026-06-13 댓글 API route 충돌과 프론트 fetch 대상 오류

### 상황

댓글 조회 API를 추가하고 프론트 게시글 상세 화면에서 호출하려고 했다.

### 문제

백엔드 comments router가 아래 구조로 작성되어 있었다.

```python
router = APIRouter(prefix="/posts/{post_id}", tags=["comments"])

@router.get("")
def get_comments(...):
    ...
```

이렇게 하면 실제 endpoint가 `/posts/{post_id}`가 된다.
이미 게시글 상세 API가 같은 경로를 사용하고 있어서 Swagger/OpenAPI에서 댓글 API가 별도 경로로 보이지 않았다.

프론트에서도 댓글 조회 함수가 아래 경로를 호출하고 있었다.

```txt
GET /posts/{id}
```

이 경로는 댓글 API가 아니라 게시글 상세 API다.

### 해결

백엔드 route를 명확히 아래 경로로 수정했다.

```txt
GET /posts/{post_id}/comments
```

프론트는 `frontend/src/app/api/comments.ts`를 만들어 댓글 API 호출을 분리했다.
`PostDetail.tsx`는 `getPostComments(id)`를 호출하고 응답의 `items`를 화면 state로 변환하도록 수정했다.

### 추가로 고친 점

`useEffect` dependency가 `[comments]`였는데, 댓글 state가 바뀔 때마다 다시 fetch될 수 있어 `[id]`로 수정했다.

### 검증

```txt
GET /posts/1/comments -> 200, total=0
GET /posts/999999/comments -> 404
OpenAPI path -> /posts/{post_id}/comments 등록 확인
npm run build -> 성공
```
