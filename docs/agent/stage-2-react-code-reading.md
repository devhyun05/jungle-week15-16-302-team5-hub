# 2단계 React 코드 이해 및 학습 정리

이 문서는 JungleLog의 React mock UI 코드를 읽기 위한 순서표다.
목표는 기능을 추가하기 전에 현재 코드가 어떤 React 개념으로 동작하는지 설명할 수 있게 되는 것이다.

## 2단계 목표

- URL과 페이지 컴포넌트가 어떻게 연결되는지 이해한다.
- mock data가 화면에서 어떻게 필터링되고 렌더링되는지 이해한다.
- `useState`, `useMemo`, `useParams`, `useSearchParams`, `useNavigate`의 사용 위치를 찾는다.
- STUDENT / COACH 역할 분기가 어떤 구조로 동작하는지 이해한다.
- 백엔드 API로 교체될 부분과 프론트에 남을 부분을 구분한다.

## 읽는 순서

### 1. 라우트와 전체 레이아웃

먼저 URL이 어떤 화면으로 연결되는지 봐야 한다.

| 파일 | 확인할 것 |
| --- | --- |
| `frontend/src/app/routes.tsx` | `createBrowserRouter`, `path`, `element`, `RoleGate` |
| `frontend/src/app/layouts/MainLayout.tsx` | 사이드바, header, role state, notification dropdown, `Outlet` |
| `frontend/src/app/components/RoleGate.tsx` | 권한 제한 UI, `useOutletContext` |

핵심 흐름:

```txt
URL 접속
-> routes.tsx에서 path 매칭
-> MainLayout 렌더링
-> Outlet으로 자식 페이지 렌더링
-> RoleGate가 필요한 화면은 current role 확인
```

### 2. 공통 mock data 구조

화면보다 먼저 데이터 모양을 알아야 한다.

| 파일 | 확인할 것 |
| --- | --- |
| `frontend/src/app/data/mockData.ts` | type 정의, posts, portfolioProjects, reviewRequests, notifications |

중요한 타입:

- `UserRole`: `STUDENT` 또는 `COACH`
- `CategorySlug`: 게시글 카테고리 slug
- `ReviewStatus`: 코치 리뷰 요청 상태
- `PortfolioStatus`: 학생이 직접 바꾸는 포트폴리오 상태
- `MockPost`: 게시글 mock data 구조
- `PortfolioProject`: 포트폴리오 프로젝트 mock data 구조
- `ReviewRequest`: 코치 리뷰 요청 mock data 구조

### 3. 게시글 목록과 상세

게시판 기본 흐름을 이해하는 구간이다.

| 파일 | 확인할 것 |
| --- | --- |
| `frontend/src/app/pages/posts/Posts.tsx` | `useSearchParams`, 검색어 state, 카테고리 필터, `filteredPosts` |
| `frontend/src/app/pages/posts/PostDetail.tsx` | `useParams`, id 기반 게시글 찾기, 댓글 state, 삭제 mock |
| `frontend/src/app/pages/posts/PostEdit.tsx` | controlled input, 작성/수정 mock, `useNavigate` |
| `frontend/src/app/pages/posts/MyRecords.tsx` | 내 기록 필터, 공개/비공개 필터, 검색 |

핵심 흐름:

```txt
/posts?category=learning-log
-> useSearchParams로 category 읽기
-> posts.filter로 category와 keyword 조건 적용
-> Link로 /posts/:id 이동
-> PostDetail에서 useParams로 id 읽기
-> posts.find로 상세 데이터 찾기
```

### 4. 포트폴리오 관리와 AI 도우미

이 프로젝트의 핵심 서비스 흐름이다.

| 파일 | 확인할 것 |
| --- | --- |
| `frontend/src/app/pages/portfolio/Portfolio.tsx` | 프로젝트 등록 mock, 선택 프로젝트, 상태 변경, 기록 연결 |
| `frontend/src/app/pages/ai/AIAssistant.tsx` | 프로젝트 선택, 연결 기록 참고, 생성 결과 mock |

핵심 흐름:

```txt
GitHub 프로젝트 등록 mock
-> projects state에 프로젝트 추가
-> 프로젝트 카드 선택
-> 연결된 학습 기록 확인
-> AI 도우미로 이동
-> 선택 프로젝트와 연결 기록을 참고해서 결과 생성 mock
```

백엔드/AI 연결 후 바뀔 부분:

- GitHub repo URL 분석
- README/commit 가져오기
- 프로젝트 저장
- 프로젝트-게시글 연결 저장
- OpenAI/RAG/MCP/Agent 호출
- 생성 결과 저장

### 5. 코치 리뷰와 역할 분기

STUDENT와 COACH가 같은 URL에서 다른 화면을 보는 구조다.

| 파일 | 확인할 것 |
| --- | --- |
| `frontend/src/app/pages/coach/CoachReview.tsx` | `StudentReviewView`, `CoachInboxView`, `useOutletContext`, 리뷰 상태 변경 |
| `frontend/src/app/pages/dashboard/Dashboard.tsx` | role에 따른 대시보드 분기 |

핵심 흐름:

```txt
MainLayout에서 role state 관리
-> Outlet context로 role 전달
-> CoachReview에서 role 읽기
-> STUDENT면 리뷰 요청 화면
-> COACH면 리뷰 인박스 화면
```

## React 개념별 위치

| 개념 | 사용 위치 |
| --- | --- |
| Component | 모든 page 파일과 `RoleGate`, `MainLayout` |
| Props | `RoleGate`의 `allowedRoles`, `children` |
| State | 검색어, 선택 프로젝트, 댓글, 리뷰 요청, 포트폴리오 상태 |
| Controlled input | `PostEdit`, `Posts`, `MyRecords`, `CoachReview`, `Portfolio` |
| Conditional rendering | role 분기, 접근 제한, 빈 목록, 안내 문구 |
| Derived data | `useMemo`로 만든 필터링 결과 |
| Routing | `routes.tsx`, `Link`, `NavLink` |
| URL params | `PostDetail`, `PostEdit`의 `useParams` |
| Query string | `Posts`, `AIAssistant`의 `useSearchParams` |
| Programmatic navigation | `PostDetail`, `PostEdit`의 `useNavigate` |

## 직접 확인할 미션

1. `/posts?category=learning-log`에 들어갔을 때 어떤 코드가 카테고리를 읽는지 찾기
2. `/posts/1`에 들어갔을 때 어떤 코드가 id에 맞는 게시글을 찾는지 찾기
3. 게시글 작성 화면에서 제목 입력값이 어느 state에 저장되는지 찾기
4. 포트폴리오 프로젝트 카드를 누르면 어떤 state가 바뀌는지 찾기
5. 기록 연결하기에서 체크한 게시글 id가 어떻게 프로젝트에 반영되는지 찾기
6. AI 도우미에서 선택 프로젝트가 바뀌면 참고 자료가 어떻게 바뀌는지 찾기
7. STUDENT와 COACH 화면 차이를 만드는 조건문을 찾기

## 2단계 완료 기준

- 위 파일들의 역할을 말할 수 있다.
- mock data가 실제 API 응답으로 바뀔 때 어느 파일이 바뀔지 예상할 수 있다.
- `useState`, `useMemo`, `useParams`, `useSearchParams`, `useNavigate`의 역할을 코드 위치와 함께 설명할 수 있다.
- `docs/agent/study.md`에 내가 이해한 내용을 추가한다.

