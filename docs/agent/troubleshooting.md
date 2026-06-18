# Troubleshooting

JungleLog 구현 중 실제로 만난 문제와 해결 과정을 정리한다. `test.md`가 반복 검증 체크리스트라면, 이 문서는 왜 문제가 생겼고 어떻게 해결했는지 남기는 기록이다.

## 2026-06-10 - 헤더 전체 검색 UI가 동작하지 않음

- 영역: 프론트엔드 공통 레이아웃
- 증상: `MainLayout` 헤더의 검색창이 보였지만 입력해도 결과 이동이나 필터링이 없었다.
- 원인: 검색어 state, submit handler, 결과 화면 연결이 없었다.
- 해결: 현재 단계에서는 페이지별 검색만 유지하고 동작하지 않는 헤더 검색 UI를 제거했다.
- 다시 확인할 것: 전역 검색을 다시 만들 때는 `/posts?keyword=...` 이동 또는 검색 API 설계를 먼저 한다.
- 관련 파일: `frontend/src/app/layouts/MainLayout.tsx`

## 2026-06-11 - CoachReview 학생/코치 요청 state가 분리됨

- 영역: 프론트엔드 코치 리뷰
- 증상: 코치가 피드백과 상태를 변경해도 학생의 요청 현황에 자연스럽게 반영되지 않았다.
- 원인: `StudentReviewView`와 `CoachInboxView`가 서로 다른 `requests` state를 갖고 있었다.
- 해결: `requests` state를 부모 `CoachReview`로 올리고 학생/코치 화면에 props로 전달했다.
- 다시 확인할 것: 학생은 requester 기준, 코치는 coachIds 기준으로 같은 원본 state를 필터링해서 보는지 확인한다.
- 관련 파일: `frontend/src/app/pages/coach/CoachReview.tsx`

## 2026-06-11 - FastAPI CORS 옵션 오타

- 영역: 백엔드 FastAPI 설정
- 증상: `/health` 요청 시 500 Internal Server Error가 발생했다.
- 원인: `CORSMiddleware` 옵션을 `allow_methos`로 잘못 적었다. 올바른 이름은 `allow_methods`다.
- 해결: 옵션명을 `allow_methods`로 수정했다.
- 다시 확인할 것: 서버 실행 후 `/health`가 HTTP 200으로 응답하는지 확인한다.
- 관련 파일: `backend/app/main.py`

## 2026-06-11 - /health 실제 응답과 Swagger schema 불일치

- 영역: 백엔드 라우터 구조
- 증상: Swagger에는 `status`, `service`가 보였지만 실제 `/health`는 `{"status":"ok"}`만 반환했다.
- 원인: `main.py`의 직접 `/health` endpoint와 `routers/health.py`의 `/health` router가 중복 등록되어 있었다.
- 해결: `main.py`의 직접 endpoint를 제거하고 `app.include_router(health_router)`만 사용했다.
- 다시 확인할 것: `/docs` schema와 실제 `/health` 응답이 일치하는지 확인한다.
- 관련 파일: `backend/app/main.py`, `backend/app/routers/health.py`

## 2026-06-13 - 댓글 API route 충돌

- 영역: 백엔드 댓글 API / 프론트 게시글 상세
- 증상: 댓글 조회 API가 Swagger에서 별도 경로로 보이지 않고 게시글 상세와 충돌했다.
- 원인: comments router가 `prefix="/posts/{post_id}"`와 `@router.get("")` 조합으로 작성되어 실제 endpoint가 `/posts/{post_id}`가 되었다.
- 해결: 명확하게 `GET /posts/{post_id}/comments` 경로로 수정하고 프론트도 `getPostComments(id)`를 호출하도록 분리했다.
- 추가 수정: 댓글 fetch `useEffect` dependency를 `[comments]`가 아니라 `[id]`로 바꿔 무한 재요청을 막았다.
- 검증:
  - `GET /posts/1/comments -> 200`
  - `GET /posts/999999/comments -> 404`
  - OpenAPI path에 `/posts/{post_id}/comments` 표시

## 2026-06-13 - PowerShell에서 한글 댓글이 깨져 보임

- 영역: API QA / 터미널 인코딩
- 증상: PowerShell `Invoke-RestMethod`로 한글 댓글을 보낼 때 응답의 한글이 깨져 보였다.
- 원인: FastAPI/DB 문제라기보다 PowerShell 출력/입력 인코딩 문제였다.
- 해결:
  - API 기능 검증용 body는 ASCII 문자열을 사용했다.
  - 한글 표시 확인은 Swagger UI 또는 브라우저에서 했다.
  - 필요 시 PowerShell UTF-8 출력 설정을 사용한다.
- 참고 명령:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

## 2026-06-14 - FastAPI TestClient 실행 시 httpx/httpx2 문제

- 영역: 백엔드 테스트 환경
- 증상: `fastapi.testclient.TestClient` 실행 시 다음 오류가 발생했다.

```txt
RuntimeError: The starlette.testclient module requires the httpx2 package to be installed.
```

- 원인: 현재 FastAPI/Starlette 버전이 요구하는 테스트 client 의존성이 맞지 않았다.
- 해결: 해당 단계에서는 추가 설치 대신 실행 중인 uvicorn 서버에 실제 HTTP 요청을 보내 검증했다.
- 나중에 할 일: pytest 기반 자동 테스트를 본격화할 때 FastAPI/Starlette에 맞는 테스트 dependency를 정리한다.

## 2026-06-14 - Invoke-WebRequest와 204 No Content 처리

- 영역: API QA
- 증상: `DELETE /posts/{id}`는 실제로 성공했지만 PowerShell `Invoke-WebRequest`에서 빈 응답 처리 중 예외처럼 보였다.
- 원인: 204는 응답 body가 없는 것이 정상인데, 도구가 빈 body를 이상하게 처리했다.
- 해결: 상태 코드만 확인할 때는 `curl.exe`를 사용했다.

```powershell
curl.exe -s -o NUL -w "%{http_code}" -X DELETE "http://localhost:8000/posts/{post_id}"
```

## 2026-06-15 - review_request_coaches 삭제 오류

- 영역: 백엔드 코치 리뷰 API
- 증상: 리뷰 요청 취소 API에서 다음 오류가 발생했다.

```txt
AssertionError: Dependency rule on column 'review_requests.id' tried to blank-out primary key column 'review_request_coaches.review_request_id'
```

- 원인: `review_request_coaches`는 `review_request_id`, `coach_id`가 복합 primary key인데, 부모 `ReviewRequest`를 ORM delete할 때 SQLAlchemy가 자식 row의 FK를 NULL로 만들려 했다. PK는 NULL이 될 수 없다.
- 해결: 연결 테이블 row를 먼저 bulk delete하고, 그 다음 review_requests row를 삭제했다.

```python
db.execute(delete(ReviewRequestCoach).where(ReviewRequestCoach.review_request_id == review_request.id))
db.execute(delete(ReviewRequest).where(ReviewRequest.id == review_request.id))
db.commit()
```

## 2026-06-15 - 관리자 PATCH 422

- 영역: 관리자 승인 API QA
- 증상: `PATCH /admin/users/{user_id}` QA 중 422 Validation Error가 발생했다.
- 원인: PowerShell here-string을 통해 한글 상태값을 전달하는 과정에서 `승인 완료` 같은 literal이 깨져 Pydantic `Literal` 검증에 실패했다.
- 해결: QA 스크립트에서 repository 상수 또는 unicode escape를 사용해 실제 코드의 상태값과 동일하게 전달했다.

## 2026-06-15 - 개발용 seed와 실제 OAuth 사용자 충돌

- 영역: 인증/DB seed
- 증상: OAuth/JWT를 붙인 뒤에도 demo user가 DB에 남아 관리자 승인 화면과 실제 사용자 흐름을 헷갈리게 했다.
- 원인: mock 단계에서 만든 demo seed가 실제 로그인 사용자 데이터와 섞였다.
- 해결:
  - `init_db()`에서 개발용 사용자/게시글 seed를 제거했다.
  - 기본 카테고리 seed만 유지했다.
  - 기존 DB에 남은 demo row는 별도 cleanup으로 제거했다.
- 배운 점: seed 데이터와 실제 서비스 데이터를 구분해야 한다.

## 2026-06-15 - OAuth sub만 보면 email unique 충돌 가능

- 영역: Google OAuth 사용자 연결
- 문제: Google callback에서 `google_sub`로만 사용자를 찾으면, 같은 email의 기존 row가 있을 때 새 row 생성으로 `users.email` unique 제약에 걸릴 수 있다.
- 해결:
  - 먼저 `google_sub`로 찾는다.
  - 없으면 verified email로 한번 더 찾는다.
  - email row가 있으면 새로 만들지 않고 기존 row에 `google_sub`를 연결한다.
  - 기존 role과 approvalStatus는 보존한다.

## 2026-06-15 - 코치 리뷰 요청 대상 목록 422

- 영역: 코치 리뷰 요청 화면
- 증상: 학생이 게시글을 작성한 뒤 코치 리뷰 요청 대상으로 보이지 않았고 `Input should be less than or equal to 50` 문구가 보였다.
- 원인: 프론트가 `getMyPosts({ size: 100 })`으로 요청했지만 백엔드 `/me/posts`는 `size <= 50`으로 제한했다.
- 해결:
  - `REVIEW_TARGET_POST_PAGE_SIZE = 50` 상수를 만들었다.
  - 요청 size를 50으로 맞췄다.
- 배운 점: 프론트 API 호출값은 백엔드 Query 제한과 맞아야 한다.

## 2026-06-15 - DB/API는 최신인데 브라우저 role/status가 낡게 보임

- 영역: 프론트 API client / dev server
- 증상:
  - DB와 API 응답은 `피드백 완료`인데 브라우저에서는 계속 `대기 중`으로 보였다.
  - DB에서 ADMIN으로 복구했지만 브라우저 사이드바는 COACH 메뉴를 보여줬다.
- 원인:
  - 오래 떠 있던 Vite dev server HMR state와 브라우저 캐시가 섞였다.
  - access token 만료 후 일반 API가 refresh retry를 공통 처리하지 않았다.
- 해결:
  - `apiFetch()`를 추가해 401 발생 시 `/auth/refresh` 후 원래 요청을 한 번 재시도했다.
  - 인증/조회 API에 `cache: "no-store"`를 추가했다.
  - Vite dev server를 재시작했다.

## 2026-06-16 - PowerShell 파이프 한글 리터럴 인코딩 QA 이슈

- 영역: QA 스크립트 / 인코딩
- 증상: PowerShell here-string 안에 한글 상태값을 직접 적어 Python으로 pipe했더니 Python 쪽에서 물음표 문자열처럼 깨졌다.
- 원인: Windows PowerShell stdin과 Python 입력 인코딩이 맞지 않았다.
- 해결:
  - 한글 상태값은 코드 내부 상수를 import해서 사용했다.
  - 또는 unicode escape로 전달했다.
- 배운 점: 한글 exact match QA는 터미널 입력보다 코드 상수나 파일 기반 입력이 안전하다.

## 2026-06-16 - QA cleanup 순서 문제

- 영역: DB QA cleanup
- 증상: QA cleanup 중 FK 오류가 발생했다.
- 원인: `posts`를 지우기 전에 `post_tags`, `portfolio_project_posts` 같은 연결 테이블을 먼저 지우지 않았다.
- 해결: 자식/연결 테이블을 먼저 삭제하고 부모 테이블을 삭제하도록 순서를 정리했다.
- 배운 점: FK가 있는 데이터는 부모보다 자식을 먼저 지워야 한다.

## 2026-06-16 - Playwright package는 있지만 Chromium executable이 없음

- 영역: 브라우저 QA
- 증상: `playwright.chromium.launch()` 실행 시 executable이 없다는 오류가 발생했다.
- 원인: Playwright npm package는 설치되어 있었지만 기본 Chromium binary가 설치되어 있지 않았다.
- 해결: 새 브라우저 다운로드 없이 `chromium.launch({ channel: "chrome" })`로 로컬 Chrome을 사용해 smoke QA를 진행했다.

## 2026-06-16 - TestClient cookie jar로 인증이 안 잡힘

- 영역: 백엔드 API QA
- 증상: `client.cookies.set(..., domain="testserver")`로 token을 넣었는데 보호 API가 401을 반환했다.
- 원인: TestClient cookie jar의 domain/path 매칭 때문에 실제 요청에 cookie가 실리지 않았다.
- 해결: 요청마다 `headers={"Cookie": "access=...; refresh=..."}` 형태로 명시했다.
- 배운 점: 인증 QA에서 401이 나오면 기능 버그라고 단정하기 전에 cookie가 실제 요청에 실렸는지 확인한다.

## 2026-06-16 - Markdown 파일 한글이 물음표/깨진 문자로 바뀜

- 영역: 문서 인코딩
- 증상: 일부 Markdown 파일의 한글이 물음표 문자열 또는 깨진 문자로 저장되어 읽을 수 없었다.
- 원인: PowerShell pipe/here-string 또는 잘못된 인코딩 저장 과정에서 UTF-8 한글이 손상된 것으로 판단된다.
- 해결:
  - `rg -n "\?\?\?"`로 손상 범위를 찾았다.
  - 손상된 agent 문서를 현재 프로젝트 상태 기준으로 다시 한글로 재작성했다.
  - 이후 문서 작성 시 UTF-8 저장을 우선한다.
- 예방:
  - 긴 한글 문서를 PowerShell pipe로 직접 만들지 않는다.
  - VSCode에서 UTF-8 인코딩을 확인한다.
  - 문서 변경 후 `rg -n "\?\?\?" docs README.md`로 확인한다.

