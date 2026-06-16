# JungleLog 학습 정리

이 문서는 구현한 코드를 이해하기 위해 알아야 하는 개념을 정리한다. 구현이 끝날 때마다 “수정한 파일”, “코드 흐름”, “핵심 개념”, “다음에 공부할 것”을 남긴다.

## 1단계: React mock UI

### 이해할 파일

| 파일 | 역할 |
| --- | --- |
| `frontend/src/app/routes.tsx` | URL path와 page component 연결 |
| `frontend/src/app/layouts/MainLayout.tsx` | 공통 레이아웃, 사이드바, 헤더 |
| `frontend/src/app/components/RoleGate.tsx` | 역할 기반 접근 제한 |
| `frontend/src/app/data/mockData.ts` | mock posts, projects, reviews, notifications |
| `frontend/src/app/pages/posts/*` | 게시글 목록/상세/작성/수정 화면 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 포트폴리오 관리 화면 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | AI 도우미 화면 |
| `frontend/src/app/pages/coach/CoachReview.tsx` | 학생/코치 리뷰 화면 |

### React 개념

- Component: 화면 조각을 함수로 나눈다.
- Props: 부모가 자식에게 값을 전달한다.
- State: 화면에서 바뀌는 값을 저장한다.
- Controlled input: input value를 state로 관리한다.
- Conditional rendering: 조건에 따라 다른 UI를 보여준다.
- React Router: URL에 맞는 page component를 렌더링한다.
- `useParams`: `/posts/:id` 같은 path parameter를 읽는다.
- `useSearchParams`: `/posts?category=learning-log` 같은 query string을 읽는다.
- `useNavigate`: 코드에서 다른 URL로 이동한다.
- `useMemo`: 검색/필터 결과처럼 계산 비용이 있는 값을 dependency가 바뀔 때만 다시 계산한다.

### 핵심 흐름

```txt
사용자가 /posts/3 접속
-> routes.tsx가 PostDetail을 렌더링
-> PostDetail이 useParams로 id=3을 읽음
-> mock posts 또는 API에서 id=3 게시글을 찾음
-> 찾으면 상세 표시, 없으면 404 안내 표시
```

## 2단계: UI 안정화와 mock 동작

### 학습 포인트

- mock UI는 서버 없이도 흐름을 이해하기 위한 단계다.
- useState로 작성/수정/삭제/댓글/리뷰 요청이 동작하는 것처럼 만들 수 있다.
- 하지만 실제 저장, 권한, 검색, 리뷰 요청은 백엔드 API가 필요하다.

### role 기반 UI

```txt
current user role
-> STUDENT면 학생 메뉴
-> COACH면 코치 메뉴
-> ADMIN이면 관리자 메뉴
-> RoleGate에서 접근 가능 역할 확인
```

### Link와 NavLink

- `Link`: 단순 이동에 사용한다.
- `NavLink`: 현재 URL과 일치할 때 active 스타일을 주기 좋다.

## 3단계: 백엔드 기본 구조

### 이해할 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/main.py` | FastAPI app 생성, middleware, router 등록 |
| `backend/app/core/config.py` | 환경변수 설정 관리 |
| `backend/app/db/session.py` | SQLAlchemy engine/session 생성 |
| `backend/app/db/base.py` | SQLAlchemy Base 선언 |
| `backend/app/db/init_db.py` | 테이블 생성, 기본 카테고리 seed |
| `backend/app/routers/health.py` | health check API |

### FastAPI 기본 흐름

```txt
브라우저/Swagger가 HTTP 요청
-> FastAPI router endpoint 실행
-> dependency가 DB session/current user 주입
-> service 호출
-> repository가 DB 조회/저장
-> schema 형태로 JSON 응답
```

### SQLAlchemy session

- `engine`: DB 연결을 관리하는 핵심 객체
- `SessionLocal`: 요청마다 DB 작업 단위를 만들기 위한 factory
- `get_db`: FastAPI dependency로 session을 열고, 요청이 끝나면 닫는다.

## 4단계: DB 설계와 SQLAlchemy 모델

### 핵심 테이블

| 테이블 | 역할 |
| --- | --- |
| users | Google OAuth 사용자, role/approval 관리 |
| posts | 학습 로그, 트러블슈팅, 회고, 면접 질문, 포트폴리오 게시글 |
| post_categories | 게시글 카테고리 기준 데이터 |
| comments | 게시글 댓글 |
| tags | 태그 목록 |
| post_tags | 게시글과 태그 N:M 연결 |
| portfolio_projects | GitHub 기반 포트폴리오 프로젝트 |
| portfolio_project_posts | 프로젝트와 학습 기록 N:M 연결 |
| review_requests | 코치 리뷰 요청 |
| review_request_coaches | 리뷰 요청과 코치 N:M 연결 |
| notifications | 사용자 알림 |
| user_approval_logs | 관리자 승인/역할 변경 이력 |
| auth_refresh_tokens | refresh token hash 저장 |
| github_commits | 프로젝트별 GitHub commit message 저장 |

### PK/FK 이해

- `users.id`: 사용자 PK
- `posts.author_id`: 어떤 사용자가 쓴 글인지 가리키는 FK
- `comments.post_id`: 어떤 게시글의 댓글인지 가리키는 FK
- `portfolio_projects.owner_id`: 프로젝트 소유자 FK

## 5단계: 게시글/댓글 API

### 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/posts.py` | 게시글 HTTP endpoint |
| `backend/app/services/post_service.py` | 게시글 비즈니스 규칙 |
| `backend/app/repositories/post_repository.py` | 게시글 DB query |
| `backend/app/schemas/post.py` | 게시글 request/response 타입 |
| `frontend/src/app/api/posts.ts` | 프론트 게시글 API client |
| `frontend/src/app/pages/posts/PostDetail.tsx` | 상세/댓글/삭제 UI |

### 코드 흐름

```txt
POST /posts
-> router가 request body와 current_user를 받음
-> service가 제목/본문 검증, 카테고리 확인
-> repository가 posts/tags/post_tags 저장
-> service가 response schema로 변환
-> router가 201 반환
```

### 배운 개념

- router/service/repository 분리
- Pydantic request/response schema
- 400/404/422 차이
- soft delete
- transaction

## 6단계: Google OAuth / JWT 인증

### 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/core/security.py` | JWT 생성/검증, token hash |
| `backend/app/routers/auth.py` | Google OAuth, me, refresh, logout endpoint |
| `backend/app/services/auth_service.py` | 로그인/토큰 발급 흐름 |
| `backend/app/repositories/user_repository.py` | 사용자 조회/생성/갱신 |
| `backend/app/repositories/auth_token_repository.py` | refresh token 저장/폐기 |
| `frontend/src/app/contexts/AuthContext.tsx` | 프론트 현재 사용자 상태 관리 |
| `frontend/src/app/api/auth.ts` | 인증 API client |

### 인증 흐름

```txt
Google로 계속하기 클릭
-> /auth/google/login
-> Google 로그인
-> /auth/google/callback?code=...
-> 백엔드가 Google userinfo 조회
-> users row 생성/연결
-> access/refresh cookie 설정
-> 프론트 /auth/me로 현재 사용자 확인
```

### 중요한 결정

- Google은 “이 사람이 누구인지” 확인한다.
- JungleLog의 권한은 DB의 `role`, `approvalStatus`가 결정한다.
- refresh token 원문은 DB에 저장하지 않고 hash만 저장한다.
- `ADMIN_EMAILS` 최고관리자는 실수로 role/status가 바뀌면 안 된다.

## 7단계: 관리자 승인

### 학습 포인트

- RBAC: Role-Based Access Control
- Audit log: 누가 누구의 권한을 바꿨는지 기록
- 최고관리자 보호: 프론트에서 막고 백엔드에서도 막아야 한다.

### 흐름

```txt
ADMIN이 /admin/users 접속
-> GET /admin/users
-> 승인 대기/완료 사용자 조회
-> role/status 선택
-> PATCH /admin/users/{id}
-> user_approval_logs에 이력 저장
```

## 8단계: 포트폴리오 프로젝트

### 수정한 주요 파일

| 파일 | 역할 |
| --- | --- |
| `backend/app/routers/portfolio.py` | 포트폴리오 API endpoint |
| `backend/app/services/portfolio_service.py` | 프로젝트 등록/수정/발행 비즈니스 로직 |
| `backend/app/repositories/portfolio_repository.py` | 프로젝트 DB query |
| `backend/app/services/github_service.py` | GitHub REST API 호출 |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 포트폴리오 관리 UI |
| `frontend/src/app/api/portfolio.ts` | 프론트 API client와 응답 정규화 |

### GitHub 프로젝트 등록 흐름

```txt
GitHub repo URL 입력
-> 백엔드가 owner/repo/branch 파싱
-> GitHub API로 repo/readme/languages/commits 조회
-> portfolio_projects 저장
-> github_commits 저장
-> 화면에 프로젝트 카드 표시
```

### 포트폴리오 게시글 발행 흐름

```txt
포트폴리오 게시글로 발행 클릭
-> 공개/비공개 선택 modal
-> POST /portfolio/projects/{id}/publish-post
-> 처음이면 posts 생성
-> 이미 있으면 posts 갱신
-> 같으면 unchanged
-> publishedPostId로 게시글 보기 연결
```

### API 응답 정규화

- TypeScript build가 성공해도 runtime error는 날 수 있다.
- API 응답에 배열 필드가 없으면 `undefined.map` 오류가 날 수 있다.
- 그래서 `frontend/src/app/api/portfolio.ts`에서 `githubCommits ?? []` 같은 기본값을 넣는다.

## 9단계: 코치 리뷰

### 학습 포인트

- 학생과 코치는 같은 리뷰 요청 데이터를 다른 관점에서 본다.
- 학생: 내가 보낸 요청 목록
- 코치: 나에게 들어온 인박스
- 피드백은 댓글과 다르다. 댓글은 원문 게시글 대화이고, 코치 피드백은 리뷰 요청에 대한 공식 피드백이다.

### 흐름

```txt
STUDENT가 리뷰 요청 생성
-> review_requests 저장
-> review_request_coaches 연결
-> COACH가 inbox에서 요청 조회
-> COACH가 상태와 feedback 전송
-> STUDENT가 요청 현황에서 상태/피드백 확인
```

## 10단계: GitHub 참고 자료와 AI 준비

### 이번에 준비한 데이터

- README 원문 전체: `portfolio_projects.readme_content`
- 커밋 메시지 전체: `github_commits`
- 연결된 학습 기록: `portfolio_project_posts`
- 저장된 포트폴리오 글: `saved_portfolio_draft`
- 저장된 면접 질문: `saved_interview_questions`

### 화면과 AI 입력의 차이

- 화면: 요약과 최근 일부만 보여준다.
- AI/RAG: README 원문 전체와 수집된 전체 커밋 메시지를 참고한다.

이렇게 해야 화면은 깔끔하고, AI는 충분한 근거를 갖는다.

### commit diff를 제외한 이유

- 데이터 양이 너무 커진다.
- lock file, 자동 포맷팅, 빌드 산출물이 섞이면 AI 품질이 떨어질 수 있다.
- v1 포트폴리오/면접 질문에는 commit message만으로도 개발 흐름을 어느 정도 파악할 수 있다.

## 다음에 공부할 키워드

Frontend:

- React component
- props/state
- controlled input
- React Router
- useParams/useSearchParams/useNavigate
- Context API
- API client 분리
- optimistic update와 refetch

Backend:

- FastAPI router/dependency
- Pydantic schema
- SQLAlchemy relationship
- transaction
- JWT/OAuth2
- HttpOnly cookie
- RBAC
- PostgreSQL join/index

AI:

- RAG document chunking
- embedding
- pgvector
- OpenAI API
- function calling
- MCP server
- Agent loop

## 2026-06-16 학습 기록: 포트폴리오 UI 구조 정리

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 포트폴리오 관리 화면의 상태 필터와 GitHub 참고 정보 렌더링을 담당한다.

### 이번 구현에서 볼 React 개념

- `useState`: `coachStatusFilter`에 현재 선택된 코치 리뷰 상태를 저장한다.
- `useMemo`: 검색어와 코치 리뷰 상태가 바뀔 때 `filteredProjects`를 다시 계산한다.
- 조건부 className: 선택된 필터와 선택되지 않은 필터의 스타일을 다르게 보여준다.
- 배열 `map`: 필터 항목, 기술 스택, 최근 커밋 목록을 반복 렌더링한다.
- `details` / `summary`: README 참고 자료를 접힘/펼침 UI로 보여준다.

### 이해 포인트

- segmented control은 여러 선택지 중 하나만 고르는 UI다. 기능은 기존 버튼과 같지만, 하나의 묶음처럼 보여서 화면이 덜 어수선하다.
- GitHub 참고 정보는 AI/RAG의 재료이지만 사용자가 매번 자세히 읽는 핵심 산출물은 아니다. 그래서 포트폴리오 글보다 작은 오른쪽 보조 영역에 정리한다.
- 이번 작업은 API 응답 구조를 바꾸지 않고 렌더링만 바꿨기 때문에 기존 포트폴리오 프로젝트/코치 리뷰/GitHub 데이터 흐름은 유지된다.

## 2026-06-16 학습 기록: select 필터와 3단 grid

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 포트폴리오 관리 화면의 필터와 선택 프로젝트 상세 레이아웃을 담당한다.

### 이번 구현에서 볼 개념

- `select` controlled component: `value={coachStatusFilter}`와 `onChange`로 현재 필터 상태를 React state에 저장한다.
- 표시명 변환 함수: `getCoachFeedbackStatusLabel()`은 DB/API 값은 유지하면서 화면에 보이는 말만 바꾼다.
- CSS grid column: `xl:grid-cols-[...]`로 큰 화면에서 포트폴리오 글 / 보조 정보 / GitHub 참고 정보를 3단으로 배치한다.
- 관심사 분리: GitHub 참고 정보는 AI/RAG 참고자료이고, 면접 질문/코치 리뷰/연결 기록은 프로젝트 관리 보조 정보라 column을 분리했다.

### 이해 포인트

- 데이터 값을 직접 바꾸면 필터 비교나 백엔드 저장 값이 꼬일 수 있다. 그래서 `요청함` 값은 그대로 두고 UI label만 `요청 대기 중`으로 바꿨다.
- 드롭다운은 항목이 많을 때 화면을 덜 어수선하게 만들고, 클릭하면 아래로 목록이 펼쳐지는 선택 UI다.
- GitHub README와 커밋 메시지는 AI가 참고하는 자료라 별도 오른쪽 column에 배치하는 편이 포트폴리오 글을 읽는 흐름을 방해하지 않는다.

## 2026-06-16 학습 기록: 카드 내부 계층 정리

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`: 포트폴리오 상세 가운데 column의 보조 정보 UI를 담당한다.

### 이번 구현에서 볼 개념

- spacing scale: `space-y-5`, `p-5`, `mb-4`처럼 반복 간격을 맞춰 같은 영역처럼 보이게 한다.
- content hierarchy: 제목/액션 버튼과 본문을 별도 박스로 나누면 사용자가 섹션 구조를 더 쉽게 읽는다.
- nested link card: 연결된 학습 기록 전체가 하나의 Link이며, 안쪽에 metadata/title/summary를 계층적으로 배치한다.
- line clamp: 긴 제목과 요약은 `line-clamp`로 고정해 카드 높이가 지나치게 늘어나는 것을 막는다.

### 이해 포인트

- UI가 어색한 이유가 기능 문제가 아니라 정보 계층 문제일 때가 많다.
- 같은 column 안의 카드들은 padding, header margin, body box 스타일을 통일해야 정돈되어 보인다.

## 2026-06-16 학습 기록: header 줄바꿈 제어

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이번 구현에서 볼 개념

- `whitespace-nowrap`: 짧은 제목이 단어 중간에서 줄바꿈되지 않도록 막는다.
- header/body 분리: 제목과 액션 버튼을 같은 줄에 넣으면 좁은 column에서 깨지기 쉬워, `space-y` 구조로 위아래를 나눴다.
- grid minmax: `minmax(320px, 0.6fr)`처럼 최소 폭을 지정하면 특정 column이 너무 좁아지는 것을 막을 수 있다.

### 이해 포인트

- 반응형 UI에서 텍스트가 이상하게 줄바꿈되면, 글자 크기보다 레이아웃 압박이 원인인 경우가 많다.
- 제목과 버튼은 같은 줄에 두면 예쁘지만, 좁은 column에서는 분리하는 편이 안정적이다.

## 2026-06-16 학습 기록: 버튼 렌더링 순서

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이해 포인트

- flex-wrap 영역에서는 JSX에 적힌 버튼 순서대로 줄바꿈이 결정된다.
- 버튼 기능을 바꾸지 않아도 렌더링 순서를 바꾸면 사용자가 보는 그룹감이 달라진다.

## 2026-06-16 학습 기록: flex 그룹 정렬

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이해 포인트

- 하나의 `flex-wrap` 안에 모든 버튼을 넣으면 화면 폭에 따라 마지막 버튼만 아래로 떨어질 수 있다.
- 관련 버튼끼리 wrapper로 묶으면 줄바꿈이 생겨도 그룹 단위로 움직이기 때문에 UI가 덜 흩어진다.
- 이번 작업은 버튼 동작을 바꾸지 않고 JSX 구조와 className만 조정했다.

## 2026-06-16 학습 기록: 액션 버튼 줄 구성

### 수정한 파일

- `frontend/src/app/pages/portfolio/Portfolio.tsx`

### 이해 포인트

- `justify-between`은 남는 공간을 좌우로 벌리기 때문에 좁은 카드 안에서는 버튼 그룹이 흩어져 보일 수 있다.
- 이번에는 `space-y-2`로 줄을 직접 나누고, 각 줄 안에서만 `flex-wrap`을 사용해 원하는 순서를 안정적으로 만들었다.

## 2026-06-16 학습 기록: OpenAI 기본 연결

### 수정한 파일

- `backend/app/core/config.py`: `.env`에서 OpenAI API key, model, max token 설정을 읽는다.
- `backend/app/schemas/ai.py`: AI 요청/응답 JSON 모양을 Pydantic schema로 정의한다.
- `backend/app/services/ai_service.py`: 프로젝트 자료를 prompt로 정리하고 OpenAI Responses API를 호출한다.
- `backend/app/routers/ai.py`: 프론트가 호출할 `/ai/generate` endpoint를 등록한다.
- `backend/app/main.py`: AI router를 FastAPI app에 포함한다.

### 이번 구현에서 사용한 개념

- FastAPI router: `/ai/generate` 같은 API 경로를 만든다.
- Service layer: OpenAI 호출처럼 비즈니스 로직이 들어가는 코드를 router 밖으로 분리한다.
- Pydantic schema: request/response의 데이터 타입을 검증한다.
- 환경변수: API key 같은 비밀값은 코드가 아니라 `.env`에서 읽는다.
- OpenAI Responses API: `client.responses.create()`로 모델 응답을 생성한다.

### 지금 단계가 RAG가 아닌 이유

- 지금은 선택된 프로젝트의 README, 커밋 메시지, 연결된 기록을 그대로 prompt에 넣는다.
- RAG는 많은 데이터 중 관련 있는 자료를 vector search로 찾은 뒤 prompt에 넣는 구조다.
- 따라서 이번 단계는 `OpenAI 단일 호출`, 다음 단계가 `RAG 검색 연결`이다.

### 내가 이해해야 할 흐름

1. 프론트가 프로젝트 id와 생성 유형을 백엔드에 보낸다.
2. 백엔드가 현재 로그인 사용자 권한을 확인한다.
3. 백엔드가 포트폴리오 프로젝트를 조회한다.
4. 백엔드가 README, 커밋, 연결 기록을 prompt로 만든다.
5. 백엔드가 OpenAI API를 호출한다.
6. 생성된 text를 프론트로 반환한다.
