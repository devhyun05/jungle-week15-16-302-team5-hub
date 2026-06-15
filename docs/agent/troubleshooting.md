
## 2026-06-15 Troubleshooting: review_request_coaches ?? ??

### ??

?? ? ?? ?? ?? API?? ?? ??? ????.

```txt
AssertionError: Dependency rule on column 'review_requests.id' tried to blank-out primary key column 'review_request_coaches.review_request_id'
```

### ??

`review_request_coaches`? ?? primary key? ?? ?? ?????. ??? ??? ???? ?? `ReviewRequest`? ORM delete? ??? SQLAlchemy? ?? ?? row? FK? NULL? ????? ????.

### ??

`db.delete(review_request)` ?? ?? ???? ?? ???? ?? bulk delete? ????.

```python
db.execute(delete(ReviewRequestCoach).where(ReviewRequestCoach.review_request_id == review_request.id))
db.execute(delete(ReviewRequest).where(ReviewRequest.id == review_request.id))
db.commit()
```

---

## 2026-06-15 Troubleshooting: ??? PATCH 422

### ??

TestClient? `PATCH /admin/users/{user_id}`? ???? ? 422? ???.

### ??

API ?? ??? ??? PowerShell heredoc ?? ?? ???? ?? Pydantic? `Literal["?? ??", ...]` ??? ???? ???.

### ??

QA ??????? ?? ?? literal? ???? repository ??? unicode escape? ????.

```python
APPROVED = user_repository.APPROVAL_APPROVED
SUSPENDED = "\uc815\uc9c0"
```

?? PATCH ??? 200?? ????.

---

## 2026-06-15 Troubleshooting: ?? QA? ?? ??

### ?? 1: PowerShell?? ?? ??? ?? ??

`?? ??`, `?? ??` ?? ???? `???`?? ?? ?? ? ??.

??:

- ??? ?? UTF-8 ???? ?? ?? ??? PowerShell ?? ??? ??? ? ??.

?? ??:

```powershell
cd C:\junhee\WEEK15_AI_BOARD\backend
.\.venv\Scripts\python.exe -c "from app.repositories.user_repository import APPROVAL_APPROVED; print(APPROVAL_APPROVED.encode('unicode_escape').decode())"
```

`\uc2b9\uc778 \uc644\ub8cc`? ??? ?? ???? `?? ??`? ????.

### ?? 2: TestClient ?? ? StarletteDeprecationWarning

??:

```txt
StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead.
```

??:

- ?? QA ???? ?? ?? ???.
- ??? ??? ?????? ???? ??? ? `httpx2` ?? FastAPI/Starlette ?? ??? ???? ????.

---
# Troubleshooting

## 2026-06-15 ??? ?? ?? ?? ?? ? ???? ?? ?? ??

### ??

??? ?? ?? ? `MainLayout.tsx`, `Login.tsx`, `PendingApproval.tsx`, `RoleGate.tsx`, `auth.ts`, `AuthContext.tsx`? ???? ? ?? UI ??? ?? ???? ??? ?? ????.

?? ??? ?? ??? ??? ??? ???, ???? ?? ?? ??? ??? ????? ?? ? ?? ??? ???.

```ts
user.approvalStatus === "?? ??"
```

? ?? ??? ???? ????? `?? ??`? ???? ???? ??? ???? ???? ???.

### ??

?? ?? ???? ?? ??? ??? ??? ??? ??????, PowerShell ?? ??? ??? ?? ?? ??? ??? ?? ???. ???? ?? ?? ???? ????, Python?? ?? ?? ??? ?? ??? ???? ? ?? ?? ???? ?? ?? ?? ?? ??? ????.

### ??

- ?? ?? ??? ??? ?? UTF-8 ?? ???? ?? ????.
- `ApprovalStatus` ??? ??? ??? ?? ??? ????.
- `RoleGate`, `MainLayout`, `Login`, `PendingApproval`? ?? ???? `?? ??`, `?? ??` ? ?? ?? ???.
- `npm run build`? TypeScript/Vite ?? ??? ????.
- ?????? `/login`? `/posts` redirect? ????.

### ?? ??

- UI ??? ?? ??? ??? ??? ??? ?? ??, ?? ?????? ??? ??? ??? ????.
- ??/???? ??? ??? ???? ???? ????.
- ???? ???? ?? ??? ????? enum/??? ??? ???? ???? ?? ??? ??? ??.

---

# Troubleshooting

## 2026-06-14 PowerShell 한글 keyword QA 주의

### 상황

`GET /me/posts`의 `visibility=private` 필터를 검증하는 과정에서 한글 제목을 keyword로 넣은 첫 QA 결과가 0건으로 나왔다.

### 확인

같은 API를 영어 제목과 `visibility=private` 조건으로 다시 검증했을 때는 정상적으로 1건이 조회되었다.

DB에서도 임시 게시글이 `is_public = false`로 저장된 것을 확인했다.

### 판단

API의 공개 범위 필터 문제라기보다 PowerShell에서 한글 문자열을 URI에 조합하는 과정의 인코딩/이스케이프 영향으로 판단했다.

### 대응

- visibility 필터는 keyword 없이 먼저 검증한다.
- keyword 검색은 영어 검색어와 프론트 실제 입력 기준으로 한 번 더 확인한다.
- 프론트는 `URLSearchParams`를 사용하므로 브라우저 입력 기반 검색에서는 인코딩 처리가 더 안정적이다.

## 2026-06-14 PowerShell Invoke-WebRequest와 204 No Content

### 상황

삭제 API QA 중 `DELETE /posts/{id}`를 `Invoke-WebRequest`로 호출했을 때 게시글은 실제로 삭제되었지만 PowerShell에서 아래 형태의 내부 예외가 발생했다.

```txt
Object reference not set to an instance of an object.
```

### 원인 판단

`DELETE /posts/{id}`는 성공 시 `204 No Content`를 반환한다. 이 응답은 body가 비어 있는 것이 정상이다. 현재 환경의 `Invoke-WebRequest`가 빈 본문 응답을 처리하는 과정에서 예외를 낸 것으로 보인다.

API 자체 문제는 아니었다. 삭제 후 `GET /posts/{id}`가 `404`였고, `curl.exe`로 확인했을 때 삭제 요청 상태 코드가 `204`였다.

### 해결 방법

204 상태 코드를 확인할 때는 아래처럼 `curl.exe`를 사용했다.

```powershell
curl.exe -s -o NUL -w "%{http_code}" -X DELETE "http://localhost:8000/posts/{post_id}"
```

### 배운 점

- 204는 응답 body가 없는 것이 정상이다.
- QA 도구가 204를 이상하게 처리할 수 있으므로 API 문제와 도구 문제를 분리해서 봐야 한다.
- 삭제 검증은 삭제 요청 상태 코드뿐 아니라 삭제 후 상세 조회가 404인지도 같이 확인하는 것이 좋다.

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

## 2026-06-15 Browser OAuth QA timeout

상황:

- Browser 플러그인으로 `http://localhost:5173/`에 진입했다.
- 비로그인 상태에서 `/login` 화면이 표시되는 것은 확인했다.
- Google 로그인 버튼 클릭 후 navigation 대기 중 timeout이 발생했고, 이후 in-app browser 세션을 다시 잡지 못했다.

판단:

- 브라우저 자동화 세션 문제로 보이며, 앱 코드나 OAuth endpoint 자체의 실패로 단정할 수 없다.
- 같은 흐름을 HTTP 기준으로 확인한 결과 `GET /auth/google/login`은 307 Google redirect와 state cookie를 정상 반환했다.

대응:

- 브라우저 자동화 대신 HTTP/code 기준 QA로 로그인 시작 흐름을 검증했다.
- 실제 Google 계정 선택과 callback 성공 여부는 사용자 브라우저에서 수동으로 확인해야 한다.

주의:

- `curl -I /auth/google/login`은 HEAD 요청이라 405가 반환된다. 이 endpoint는 GET endpoint이므로 `curl.exe -s -D - -o NUL http://localhost:8000/auth/google/login`로 확인한다.
## 2026-06-15 Troubleshooting: 개발용 seed와 실제 OAuth 사용자 흐름 충돌

문제:

OAuth/JWT를 붙인 뒤에도 DB 초기화 코드가 개발용 사용자를 자동 생성하면 관리자 승인 화면에 실제 로그인하지 않은 사용자가 나타날 수 있다. 이렇게 되면 “사용자는 Google OAuth 로그인으로 생성된다”는 서비스 흐름과 맞지 않는다.

해결:

- `init_db()`에서 개발용 사용자/게시글/태그 seed를 제거했다.
- 앱에 꼭 필요한 기준 데이터인 게시글 카테고리만 유지했다.
- 실제 사용자와 게시글은 로그인/API 요청으로 생성되게 분리했다.

배운 점:

- seed는 기준 데이터와 샘플 데이터를 구분해야 한다.
- 인증 기능이 들어온 뒤에는 샘플 사용자가 실제 권한/승인 흐름을 방해할 수 있다.
- 코드에서 seed를 제거해도 이미 DB에 들어간 데이터는 자동으로 없어지지 않는다.

추가 확인:

- 로컬 PostgreSQL 조회 결과 과거 개발용 사용자 `demo.student@junglelog.local`이 1개 남아 있었다.
- 코드 변경은 앞으로 새 개발용 사용자가 생성되지 않게 막는 것이고, 이미 들어간 DB row를 자동 삭제하지는 않는다.
- 삭제가 필요하면 실제 사용자 데이터와 구분한 뒤 별도 DB cleanup으로 처리한다.

## 2026-06-15 Troubleshooting: 코드에서 seed를 지워도 DB row가 남는 문제

문제:

`init_db.py`에서 개발용 사용자 seed 코드를 제거했지만, 이전에 로컬 PostgreSQL에 생성된 `demo.student@junglelog.local` row는 그대로 남아 있었다.

원인:

코드 변경은 앞으로 실행될 로직을 바꾸는 것이고, 이미 DB에 저장된 row를 자동으로 삭제하지 않는다.

해결:

- 삭제 전 연결 데이터 개수를 먼저 조회했다.
- demo 사용자가 작성한 게시글, 댓글, post_tags를 하위 데이터부터 삭제했다.
- 마지막에 demo 사용자 row를 삭제했다.
- 삭제 후 `legacy_demo_user_count=0`을 확인했다.

배운 점:

- 코드 상태와 DB 상태는 다르다.
- 실제 서비스 QA 전에는 이전 개발 단계에서 넣은 샘플 데이터가 남아 있는지 확인해야 한다.
- FK가 있는 데이터는 부모 row보다 자식 row를 먼저 삭제해야 한다.

## 2026-06-15 Troubleshooting: OAuth sub만 보고 사용자 생성하면 email unique 충돌 가능

문제:

기존 로직은 Google OAuth callback에서 받은 `google_sub`로만 사용자를 찾았다. 그런데 같은 이메일의 사용자가 이미 DB에 있으면 새 사용자 생성 시 `users.email` unique 제약에 걸릴 수 있다.

원인:

초기 관리자 계정, 수동 생성 계정, 이전 개발 과정에서 만들어진 계정은 이메일은 같지만 Google sub 연결이 아직 없거나 다를 수 있다.

해결:

- `google_sub` 조회 후 없으면 verified email로 한 번 더 조회한다.
- 이메일 사용자가 있으면 새 row를 만들지 않고 기존 row에 `google_sub`를 연결한다.
- role과 approvalStatus는 보존한다.

배운 점:

- OAuth 식별자는 `sub`가 안정적이지만, 계정 migration/초기 관리자 등록 상황에서는 email fallback이 필요할 수 있다.
- email fallback은 Google에서 `email_verified=True`를 확인한 뒤에만 사용해야 안전하다.
