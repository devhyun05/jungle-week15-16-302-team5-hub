# Troubleshooting

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
