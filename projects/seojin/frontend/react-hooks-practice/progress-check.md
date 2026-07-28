# React Hooks 진도 체크

이 문서는 React 훅 연습의 현재 위치를 기록하기 위한 표입니다. 세션을 시작하기 전에 Codex가 이 파일을 먼저 확인하고, 다음 추천 세션을 제안한 뒤 시작 여부를 물어봅니다.

## 상태 기준

- `미시작`: 아직 오리엔테이션을 시작하지 않음
- `진행중`: 오리엔테이션 또는 Level 3 작성 중
- `복습필요`: 작성은 했지만 개념 설명이나 재작성에서 막힘
- `완료`: Level 3을 채우고, 피드백을 반영하고, 코드 흐름을 말로 설명함

## 현재 위치

- 현재 추천 세션: 전체 세션 완료
- 다음 행동: 실제 앱 코드에서 훅 패턴 복습 또는 다음 학습 주제 선택하기
- 마지막 업데이트: 2026-06-11 / Session 14 완료

## 세션별 체크표

| 순서 | 파일 | 핵심 개념 | 상태 | 오리엔테이션 | Level 3 1회차 | 피드백 반영 | Level 3 재작성 | 말로 설명 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `01-use-state-text.tsx` | 문자열 state, setter, 렌더링 | 완료 | [x] | [x] | [x] | [x] | [x] | 코드 재작성 및 말로 설명 완료 |
| 2 | `02-use-state-boolean.tsx` | boolean state, checkbox | 완료 | [x] | [x] | [x] | [x] | [x] | 재작성 및 복습 노트 정리 완료 |
| 3 | `03-controlled-input.tsx` | value, onChange, 입력 제어 | 완료 | [x] | [x] | [x] | [-] | [x] | 재작성은 건너뛰고 브라우저 확인 및 말로 설명 완료. `value`는 저장이 아니라 state를 input 화면에 보여주는 역할로 정리함 |
| 4 | `04-form-submit-event.tsx` | FormEvent, preventDefault | 완료 | [x] | [x] | [x] | [-] | [x] | `setSubKeyword(keyword)` 수정 완료. form submit, preventDefault, submit 버튼, fallback 문구 흐름 질문 정리 |
| 5 | `05-async-submit-loading.tsx` | async/await, loading, message | 완료 | [x] | [x] | [x] | [x] | [x] | `isSubmit`은 제출 중 상태, `await` 동안 버튼 비활성화, `finally`에서 다시 제출 가능하게 만드는 흐름 설명 완료 |
| 6 | `06-navigate-after-success.tsx` | useNavigate, 성공 후 이동 | 완료 | [x] | [x] | [x] | [-] | [x] | `useNavigate()`는 이동 함수를 꺼내오는 Hook이고, 조건 판단 뒤 `navigate("/posts")`를 호출해 이동하는 흐름으로 정리함 |
| 7 | `07-effect-on-mount.tsx` | useEffect, 최초 실행 | 완료 | [x] | [x] | [x] | [-] | [x] | `useEffect`는 렌더 후 실행되고, effect 안에서 `loadPost()` 호출을 만나 비동기 함수가 시작되는 흐름으로 정리함 |
| 8 | `08-effect-cleanup-event.tsx` | event listener, cleanup | 완료 | [x] | [x] | [x] | [x] | [x] | localStorage 데이터 삭제와 removeEventListener 연결 해제를 구분하고, dispatchEvent는 useEffect 재실행이 아니라 등록된 syncUser 실행이라는 흐름을 정리함 |
| 9 | `09-effect-dependencies.tsx` | dependency array, 재요청 | 완료 | [x] | [x] | [x] | [x] | [x] | 축소 검색 버전으로 `keyword`와 `submitKeyword`를 분리하고, `[submitKeyword]` 의존성으로 검색 버튼 제출 시에만 effect가 다시 실행되는 흐름을 정리함 |
| 10 | `10-use-memo-derived-value.tsx` | useMemo, 파생값 | 완료 | [x] | [x] | [x] | [x] | [x] | `postType` 원본 state와 `selectedCategory` 파생값을 구분하고, `map`의 임시 이름 `category`, 객체 속성 `label/value`, `useMemo` 실행 시점을 정리함 |
| 11 | `11-route-param-edit-mode.tsx` | useParams, 수정 모드 | 완료 | [x] | [x] | [x] | [-] | [x] | `/posts/new`와 `/posts/:postId/edit`처럼 라우터 주소 모양에 따라 `postId` 유무가 달라지고, `Boolean(postId)`로 새 글/수정 모드를 나누는 흐름을 정리함 |
| 12 | `12-object-state-update.tsx` | 객체 state, 동적 key | 완료 | [x] | [x] | [x] | [x] | [x] | `form/setForm`, `...current`, `[key]: value`, 객체 state로 묶는 이유를 정리함 |
| 13 | `13-array-toggle-state.tsx` | 배열 toggle, filter, spread | 완료 | [x] | [x] | [x] | [x] | [x] | `includes`로 선택 여부 확인, `filter`로 해제, spread와 `slice(0, 8)`로 추가 및 최대 개수 제한 흐름 정리 |
| 14 | `14-conditional-list-render.tsx` | 조건부 렌더링, map, key | 완료 | [x] | [x] | [x] | [-] | [x] | `posts.length`와 `post.tags.length` 구분, `posts.map -> post`, `post.tags.map -> tag`, Session 14 라우팅 연결 및 브라우저 확인 완료 |

## 세션 종료 기록 양식

세션이 끝나면 아래 형식으로 메모를 남깁니다.

```md
### YYYY-MM-DD / Session NN

- 한 줄 요약:
- 막힌 지점:
- 다음에 다시 말로 설명할 개념:
- 다음 추천 행동:
```

### 2026-06-09 / Session 01

- 한 줄 요약: `useState` 문자열 state, input `value`, `onChange`, 초기화 버튼을 직접 작성하고 재작성까지 완료함.
- 막힌 지점: `function` 선언식과 화살표 함수식 혼합, 초기화에서 현재 값을 다시 넣는 실수.
- 다음에 다시 말로 설명할 개념: `text`가 기억하는 값, `setText(event.target.value)` 흐름, `setText("")` 후 다시 렌더되는 이유.
- 다음 추천 행동: Session 1을 말로 설명한 뒤 완료 처리하고 Session 2로 이동.

### 2026-06-09 / Session 01 완료

- 한 줄 요약: `text`가 입력값을 기억하고, `setText(event.target.value)`와 `setText("")`가 state를 바꾼 뒤 화면을 다시 그리는 흐름을 말로 설명함.
- 막힌 지점: 없음.
- 다음에 다시 말로 설명할 개념: setter는 값을 직접 대입하는 문법이 아니라 React에 다음 state를 맡기는 함수.
- 다음 추천 행동: Session 2 `boolean` state와 checkbox 흐름 연습.

### 2026-06-09 / Session 02

- 한 줄 요약: `useState(false)`로 boolean state를 만들고 checkbox의 `checked`, `event.target.checked`, 조건부 렌더링, 초기화 버튼 흐름을 작성하고 재작성함.
- 막힌 지점: `checked`가 사용자가 짓는 변수명인지, 코드에 `true`가 직접 없는데 체크 상태가 바뀌는 이유, `label`의 필요성, 연습 페이지 import 경로.
- 다음에 다시 말로 설명할 개념: `checked={agree}`에서 고정 속성 이름과 state 이름 구분, `event.target.checked`가 브라우저에서 오는 boolean 값이라는 점.
- 다음 추천 행동: Session 3 `controlled input`에서 `value`, `onChange`, `event.target.value` 흐름을 이메일/비밀번호 입력으로 확장.

### 2026-06-09 / Session 03

- 한 줄 요약: 이메일/비밀번호 문자열 state를 만들고 `value`, `onChange`, `event.target.value`, 초기화 버튼으로 controlled input 흐름을 작성하고 브라우저에서 확인함.
- 막힌 지점: `value={email}`을 값을 저장하거나 상태를 바꾸는 역할로 이해한 부분.
- 다음에 다시 말로 설명할 개념: `event.target.value`는 브라우저 input에서 온 현재 문자열, `setEmail(...)`은 state 변경, `value={email}`은 state를 input 화면에 보여주는 연결.
- 다음 추천 행동: Session 4 `form submit event`에서 `FormEvent`, `preventDefault`, 제출 버튼 흐름 연습.

### 2026-06-09 / Session 04

- 한 줄 요약: `FormEvent<HTMLFormElement>`, `form onSubmit`, `button type="submit"`, `event.preventDefault()`, 입력 중인 `keyword`와 제출된 `subKeyword` 분리 흐름을 작성하고 수정함.
- 막힌 지점: `preventDefault()`가 어디서 온 함수인지, `form`과 `onSubmit`/submit 버튼의 관계, setter에 넘긴 값이 state로 반영되는 흐름, `subKeyword || "아직 제출 전"`의 fallback 의미.
- 다음에 다시 말로 설명할 개념: `setSubKeyword(keyword)`는 setter에 값을 저장하는 것이 아니라 React에게 `subKeyword`의 다음 값을 요청하는 함수라는 점.
- 다음 추천 행동: Session 5 `async submit loading`에서 제출 전후 `loading`, `message`, `async/await` 흐름 연습.

### 2026-06-10 / Session 05

- 한 줄 요약: `async/await`, `try/catch/finally`, `message`, `isSubmit` state로 비동기 제출 중 버튼 비활성화와 성공/실패 메시지 흐름을 작성하고 수정함.
- 막힌 지점: `try/catch/finally`가 `handleSubmit` 안에 있어야 하는 이유, `throw new Error(...)`, `error instanceof Error`, `{message && <p>{message}</p>}`의 조건부 렌더링 의미.
- 다음에 다시 말로 설명할 개념: `await`는 함수 내부의 다음 줄을 Promise 완료 후로 미루지만 브라우저 전체를 멈추지는 않는다는 점.
- 다음 추천 행동: Session 6 `navigate after success`에서 성공 후 `useNavigate`로 화면 이동하는 흐름 연습.

### 2026-06-10 / Session 06

- 한 줄 요약: `useNavigate()`로 React Router의 화면 이동 함수를 받아오고, 성공 조건 뒤 `navigate("/posts")`를 호출하는 흐름을 작성하고 수정함.
- 막힌 지점: `useNavigate`와 `navigate`의 역할 구분, `useNavigate`가 상태를 판단하는 함수인지 여부.
- 다음에 다시 말로 설명할 개념: 조건 판단은 직접 작성한 코드가 하고, `navigate`는 지정한 경로로 주소를 바꿔 React Router가 맞는 화면을 렌더링하게 한다는 점.
- 다음 추천 행동: Session 7 `mount effect`에서 `useEffect`가 컴포넌트가 처음 화면에 나타난 뒤 실행되는 흐름 연습.

### 2026-06-11 / Session 07 완료

- 한 줄 요약: `useEffect(..., [])`가 첫 렌더 후 한 번 실행되고, effect 콜백 안에서 선언한 `loadPost()`를 호출해 비동기 데이터를 state에 반영하는 흐름을 작성하고 설명함.
- 막힌 지점: `loadPost();`가 effect 안에서 코드가 위에서 아래로 실행되며 만나는 함수 호출인지, React가 따로 자동 실행하는 것인지 구분하는 부분.
- 다음에 다시 말로 설명할 개념: `await`는 `loadPost` 함수만 잠깐 멈추고, 결과가 오면 멈췄던 다음 줄부터 이어서 `setTitle`을 호출한다는 점.
- 다음 추천 행동: Session 8 `cleanup effect`에서 이벤트 리스너를 붙이고 정리하는 흐름 연습.

### 2026-06-11 / Session 08 완료

- 한 줄 요약: `addEventListener`로 브라우저 이벤트를 등록하고, `dispatchEvent`가 발생하면 등록된 `syncUser`가 localStorage를 다시 읽어 `setUser`로 화면 state를 맞추는 흐름을 작성하고 설명함.
- 막힌 지점: `"practice_user"` localStorage 키와 `{ nickname: "서진" }` 객체 안쪽 키의 구분, `dispatchEvent`가 `useEffect`를 다시 실행하는 것이 아니라 이미 등록된 listener를 실행한다는 점, 로그아웃 데이터 삭제와 cleanup 연결 해제의 차이.
- 다음에 다시 말로 설명할 개념: cleanup return은 컴포넌트가 unmount될 때 실행되고, localStorage 데이터가 아니라 브라우저에 등록된 이벤트 연결을 제거한다는 점.
- 다음 추천 행동: Session 9 `dependency array`에서 값이 바뀔 때 effect가 다시 실행되는 흐름 연습.

### 2026-06-11 / Session 09 완료

- 한 줄 요약: 검색어 입력값 `keyword`와 검색 확정값 `submitKeyword`를 분리하고, `useEffect(..., [submitKeyword])`로 제출 후에만 검색 결과를 다시 계산하는 흐름을 작성하고 설명함.
- 막힌 지점: `filter`가 조건에 맞는 항목만 남기는 함수라는 점, `map`이 배열 항목을 JSX 목록으로 바꾸는 함수라는 점.
- 다음에 다시 말로 설명할 개념: setter 호출 후 렌더가 다시 일어나고, 렌더 뒤 의존성 배열 안의 값이 바뀌었을 때 effect가 다시 실행된다는 점.
- 다음 추천 행동: Session 10 `useMemo`에서 state로 저장할 값과 렌더 중 계산해서 얻는 파생값을 구분하기.

### 2026-06-11 / Session 10 완료

- 한 줄 요약: `postType`을 원본 state로 두고, `useMemo`로 `categories.find(...)` 결과인 `selectedCategory`를 계산해 화면에 `label`을 보여주는 흐름을 작성하고 정리함.
- 막힌 지점: `selectedCategory`를 state로 따로 두지 않는 이유, `useMemo`가 effect 전/후가 아니라 렌더링 중 실행된다는 점, `category`가 `map/find` 콜백의 임시 이름이고 `label/value`가 직접 만든 객체 속성이라는 점.
- 다음에 다시 말로 설명할 개념: 클릭 -> `setPostType` -> 렌더 중 `useMemo` 재계산 -> `selectedCategory.label` 표시 -> 이후 dependency가 맞는 `useEffect` 실행 순서.
- 다음 추천 행동: Session 11 `useParams`와 `Boolean(postId)`로 새 글/수정 글 모드 나누기.

### 2026-06-11 / Session 11 완료

- 한 줄 요약: `useParams()`가 라우터의 `:postId` 값을 꺼내고, `Boolean(postId)`로 새 글 작성 모드와 수정 모드를 나누는 흐름을 작성하고 브라우저 URL 예시로 확인함.
- 막힌 지점: `postId` 이름이 어디서 오는지, `Boolean(postId)`와 `ignore`의 boolean 의미가 서로 다르다는 점, 새 글/수정 글 주소가 같은 컴포넌트를 공유하는 구조.
- 다음에 다시 말로 설명할 개념: `/posts/new`는 `postId`가 없어서 기존 글을 불러오지 않고, `/posts/2/edit`는 `postId`가 있어서 effect에서 해당 글을 불러와 input state에 반영한다는 점.
- 다음 추천 행동: Session 12 `object state update`에서 `form` 객체의 필드 하나만 안전하게 바꾸는 흐름 연습.

### 2026-06-11 / Session 12 완료

- 한 줄 요약: `form` 객체 state를 만들고 `setForm((current) => ({ ...current, [key]: value }))`로 제목/본문/유형 중 한 필드만 안전하게 바꾸는 흐름을 작성함.
- 막힌 지점: 문자열 state와 객체 state의 차이, `current`와 `...current`의 차이, 작성 모드와 수정 모드 설명이 섞이며 생긴 혼동.
- 다음에 다시 말로 설명할 개념: `setForm`은 서버 저장이 아니라 화면의 입력 state를 바꾸는 함수이고, 객체 state는 여러 입력값이 하나의 폼 데이터로 같이 움직일 때 유용하다는 점.
- 다음 추천 행동: Session 13 `array toggle state`에서 태그 배열을 직접 바꾸지 않고 새 배열로 선택/해제하는 흐름 연습.

### 2026-06-11 / Session 13 완료

- 한 줄 요약: 태그 버튼 클릭 시 `setForm` 안에서 `tag_names` 배열을 확인하고, 선택된 태그는 `filter`로 제거하고 새 태그는 spread와 `slice(0, 8)`로 추가하는 흐름을 작성함.
- 막힌 지점: 클릭 시 `useEffect`가 아니라 setter를 써야 하는 점, `tag_name`/`tag_names` 속성명 구분, `filter`가 조건을 통과한 항목만 남긴 새 배열을 만든다는 점.
- 다음에 다시 말로 설명할 개념: `slice`는 추가가 아니라 최대 8개 제한이고, 실제 추가는 `[...current.tag_names, tag]`가 한다는 점.
- 다음 추천 행동: Session 14 `conditional list render`에서 로딩/빈 목록/목록 렌더링을 조건별로 나누는 흐름 연습.

### 2026-06-11 / Session 14 완료

- 한 줄 요약: `isLoading`, `message`, `posts.length`, `posts.map`, `key`, `post.tags.map`으로 로딩/에러/빈 목록/목록 렌더링 흐름을 작성하고 브라우저에서 확인함.
- 막힌 지점: `setPosts(posts)`와 `setPosts(samplePosts)`의 차이, 전체 목록의 `posts.length`와 글 하나의 `post.tags.length` 구분.
- 다음에 다시 말로 설명할 개념: 렌더링에서는 setter가 아니라 state 배열을 읽고, `map`은 배열 항목을 JSX 항목으로 바꾸는 JavaScript 메서드라는 점.
- 다음 추천 행동: 전체 훅 패턴을 실제 앱 코드에서 복습하거나 다음 학습 주제 선택.
