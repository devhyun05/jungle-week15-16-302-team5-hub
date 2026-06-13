# Frontend Keyword Map

## 2026-06-14 게시글 수정 화면 연결에서 나온 키워드

### useEffect로 기존 데이터 불러오기

`/posts/:id/edit` 화면은 처음 렌더링될 때 URL의 id로 기존 게시글을 불러와야 한다. API 호출은 렌더링 중에 바로 실행하지 않고 `useEffect` 안에서 실행한다.

```txt
useParams로 id 읽기
-> useEffect 실행
-> getPostDetail(id)
-> 응답을 form state에 저장
```

### Controlled Input Prefill

수정 화면의 input, textarea, select는 모두 React state와 연결되어 있다. API 응답을 받은 뒤 `setTitle`, `setBody`, `setCategory`, `setTags`를 호출하면 화면 입력칸이 기존 게시글 값으로 채워진다.

### useParams

`useParams`는 URL path 안의 동적 값을 읽는다.

```txt
/posts/5/edit
-> id = "5"
```

이 id를 백엔드 API 경로에 붙여 `GET /posts/5`, `PATCH /posts/5`를 호출한다.

### useNavigate

수정 성공 후 사용자를 상세 화면으로 이동시킬 때 쓴다.

```txt
PATCH 성공
-> navigate(`/posts/${updatedPost.id}`)
```

### Loading / Error State

수정 화면은 기존 게시글을 불러오는 시간이 필요하므로 `isPostLoading`이 필요하다. 실패하면 `error` state로 사용자에게 안내한다.

## 2026-06-14 게시글 목록/상세 API 전환에서 나온 키워드

### useEffect

`Posts.tsx`와 `PostDetail.tsx`에서 API 호출을 위해 `useEffect`를 사용했다. 화면이 처음 열리거나 의존성 값이 바뀌면 다시 실행된다.

```txt
Posts.tsx 의존성: keyword, selectedCategory
PostDetail.tsx 의존성: id
```

### Loading / Error State

API는 즉시 응답하지 않을 수 있으므로 로딩과 에러 상태를 따로 둔다.

```txt
isLoading: 목록을 불러오는 중인지
loadError: 목록 조회 실패 메시지
isPostLoading: 상세를 불러오는 중인지
postLoadError: 상세 조회 실패 메시지
```

### API Response State

mock data를 직접 import해서 쓰는 대신, API 응답을 state에 저장한다.

```txt
postItems: GET /posts 응답 items
post: GET /posts/{id} 응답
```

### useSearchParams

카테고리 탭 상태는 URL query string으로 관리한다.

```txt
/posts?category=learning-log
```

프론트는 이 값을 읽어서 백엔드 `GET /posts?category=learning-log`로 다시 전달한다.

### useParams

상세 화면은 URL path의 id를 읽는다.

```txt
/posts/4
-> id = "4"
-> GET /posts/4
```

### mock data와 API data의 차이

mock data는 브라우저 안에 이미 있는 배열이라 `filter`만 하면 됐다. API data는 서버에서 받아와야 하므로 `fetch`, `loading`, `error`, `useEffect` 흐름이 필요하다.

이 문서는 JungleLog 프론트엔드 구현 과정에서 나온 키워드를 정리한다.
단순 암기가 아니라, 실제 코드에서 어떤 문제를 해결할 때 등장했는지 연결해서 기록한다.

## 작성 규칙

각 키워드는 아래 기준으로 채운다.

```txt
### 키워드

- 상태:
- 언제 나왔는가:
- 우리 프로젝트에서 어디에 쓰였는가:
- 핵심 개념:
- 관련 파일:
- 다음에 다시 볼 시점:
```

## React / Frontend

### TypeScript

- 상태: 진행 중
- 언제 나왔는가: mock data 타입, role, review status, portfolio status를 정의할 때
- 우리 프로젝트에서 어디에 쓰였는가: `mockData.ts`, `CoachReview.tsx`, `MainLayout.tsx`
- 핵심 개념: 잘못된 문자열이나 데이터 구조를 미리 막기 위해 타입을 붙인다.
- 관련 파일: `frontend/src/app/data/mockData.ts`
- 다음에 다시 볼 시점: 백엔드 API 응답 타입을 프론트 타입으로 연결할 때

### React Component

- 상태: 진행 중
- 언제 나왔는가: 페이지를 `Posts`, `Portfolio`, `AIAssistant`, `CoachReview`처럼 나눌 때
- 우리 프로젝트에서 어디에 쓰였는가: 모든 page component와 공통 UI component
- 핵심 개념: UI를 역할별 작은 함수 단위로 나누어 재사용하고 읽기 쉽게 만든다.
- 관련 파일: `frontend/src/app/pages`
- 다음에 다시 볼 시점: 백엔드 API 연결 후 화면 단위로 loading/error state를 추가할 때

### State / Props

- 상태: 진행 중
- 언제 나왔는가: 검색어, 선택한 프로젝트, 댓글 입력값, 코치 리뷰 요청 목록을 관리할 때
- 우리 프로젝트에서 어디에 쓰였는가: `useState`, props 전달, state lifting
- 핵심 개념: state는 화면에서 바뀌는 값이고, props는 부모가 자식에게 넘기는 값이다.
- 관련 파일: `frontend/src/app/pages/coach/CoachReview.tsx`
- 다음에 다시 볼 시점: API 응답을 화면 state로 관리할 때

### State Lifting

- 상태: 이해 완료, 반복 필요
- 언제 나왔는가: 학생 리뷰 요청 화면과 코치 리뷰 인박스가 같은 원본 요청 state를 공유해야 했을 때
- 우리 프로젝트에서 어디에 쓰였는가: `CoachReview` 부모 컴포넌트가 `requests` state를 들고 자식에게 전달
- 핵심 개념: 여러 자식 컴포넌트가 같은 원본 데이터를 기준으로 동작해야 하면 공통 부모로 state를 올린다.
- 관련 파일: `frontend/src/app/pages/coach/CoachReview.tsx`
- 다음에 다시 볼 시점: 프론트 전역 상태 또는 서버 state 관리 도입 여부를 판단할 때

### Event Handling

- 상태: 진행 중
- 언제 나왔는가: 버튼 클릭, 입력값 변경, select 변경을 처리할 때
- 우리 프로젝트에서 어디에 쓰였는가: `onClick`, `onChange`, form submit mock 동작
- 핵심 개념: 사용자의 행동을 함수로 받아 state를 변경하거나 라우트를 이동한다.
- 관련 파일: `PostEdit.tsx`, `Portfolio.tsx`, `CoachReview.tsx`
- 다음에 다시 볼 시점: 실제 API 요청을 이벤트에 연결할 때

### Routing

- 상태: 진행 중
- 언제 나왔는가: `/posts`, `/posts/:id`, `/portfolio`, `/coach-review` 화면을 연결할 때
- 우리 프로젝트에서 어디에 쓰였는가: React Router, `useParams`, `useSearchParams`, `useNavigate`, `useOutletContext`
- 핵심 개념: URL과 화면을 연결하고, URL 안의 값이나 query string으로 화면 상태를 결정한다.
- 관련 파일: `frontend/src/app/routes.tsx`
- 다음에 다시 볼 시점: 로그인 후 redirect, 접근 제한 redirect를 구현할 때

### Conditional Rendering

- 상태: 진행 중
- 언제 나왔는가: STUDENT / COACH 화면을 다르게 보여줄 때
- 우리 프로젝트에서 어디에 쓰였는가: `RoleGate`, `Dashboard`, `CoachReview`
- 핵심 개념: 조건에 따라 다른 컴포넌트나 안내 화면을 렌더링한다.
- 관련 파일: `frontend/src/app/components/RoleGate.tsx`
- 다음에 다시 볼 시점: 로그인 여부, loading, error, empty state를 처리할 때

### CSR / SSR

- 상태: 예정
- 언제 나왔는가: React와 Next.js 차이를 비교할 때
- 우리 프로젝트에서 어디에 쓰였는가: 현재 Vite React는 CSR 중심
- 핵심 개념: CSR은 브라우저에서 화면을 만들고, SSR은 서버에서 HTML을 먼저 만든다.
- 관련 파일: `frontend`
- 다음에 다시 볼 시점: SEO나 초기 로딩 최적화를 고민할 때

### 상태관리

- 상태: 예정
- 언제 나왔는가: role, 리뷰 요청, API 응답 state가 여러 화면에서 필요해질 때
- 우리 프로젝트에서 어디에 쓰였는가: 현재는 `useState`와 `Outlet context`만 사용
- 핵심 개념: 여러 화면이 공유하는 데이터를 어디에 둘지 결정하는 문제다.
- 관련 파일: `MainLayout.tsx`, `CoachReview.tsx`
- 다음에 다시 볼 시점: TanStack Query, Zustand, Context API 도입 여부를 판단할 때

### 테스트

- 상태: 예정
- 언제 나왔는가: `test.md`를 반복 검증 체크리스트처럼 운영하기로 했을 때
- 우리 프로젝트에서 어디에 쓰였는가: 아직 자동 테스트는 없고 수동 QA 기준만 있음
- 핵심 개념: 화면이 의도대로 동작하는지 반복 확인하는 장치다.
- 관련 파일: `docs/agent/test.md`
- 다음에 다시 볼 시점: Vitest, React Testing Library를 도입할 때

### UI Framework

- 상태: 진행 중
- 언제 나왔는가: Card, Button, Badge, Input, Textarea 같은 공통 UI를 사용할 때
- 우리 프로젝트에서 어디에 쓰였는가: `components/ui`
- 핵심 개념: 반복되는 UI 요소를 일관된 컴포넌트로 관리한다.
- 관련 파일: `frontend/src/app/components/ui`
- 다음에 다시 볼 시점: 디자인 시스템을 정리하거나 Figma와 맞출 때
