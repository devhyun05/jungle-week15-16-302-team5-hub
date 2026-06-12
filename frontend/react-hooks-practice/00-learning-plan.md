# React Hooks Top-Down Plan

목표는 React 전체를 외우는 것이 아니라, 현재 앱에서 계속 살아남을 핵심 화면의 훅 패턴을 손으로 익히는 것입니다.

별도 RAG/MCP 전용 페이지는 Agent 화면으로 통합되었으므로, 이 계획은 인증, 게시글, Agent 화면에 남는 훅 패턴을 기준으로 진행합니다.

연습용 `*.tsx` 파일에는 코드 빈칸을 넣지 않습니다. 파일에는 주석만 둡니다. Level 3 빈칸은 Codex가 세션 중 채팅으로 제공합니다.

진도는 `progress-check.md`에 기록합니다. 세션을 시작하기 전에는 항상 이 파일을 먼저 확인하고, 다음 추천 세션을 고른 뒤 시작 여부를 묻습니다.

## 세션 공통 규칙

모든 세션은 오리엔테이션으로 시작합니다.

오리엔테이션에서 먼저 다룰 것:

- 이번 파일이 앱에서 맡는 역할
- 실제 브라우저에서 사용자가 무엇을 하면 화면이 어떻게 바뀌는지
- 이번 훅이 해결하는 문제
- 필요한 React 개념
- 필요한 TypeScript 문법
- 이벤트 객체, async/await, dependency array 같은 키워드
- 변수명과 setter 이름을 그렇게 짓는 이유
- state가 바뀌면 JSX가 어떻게 다시 계산되는지
- `React가 정한 것`, `브라우저가 주는 것`, `사용자가 이름 짓는 것`의 구분
- 사용자 행동 -> 값 변화 -> setter/effect 실행 -> 렌더 반영 흐름

오리엔테이션 후에는 반드시 Level 3 빈칸부터 시작합니다.

## 시작 전 진도 확인 절차

세션 시작 요청이 오면 Codex는 다음 순서로 움직입니다.

1. `progress-check.md`를 읽습니다.
2. `완료`가 아닌 가장 앞 세션을 찾습니다.
3. 현재 추천 세션, 이전 세션 상태, 오늘 할 일을 짧게 요약합니다.
4. 사용자에게 "이 세션 오리엔테이션부터 시작할까요?"라고 묻습니다.
5. 사용자가 시작하겠다고 하면 오리엔테이션을 진행합니다.
6. 오리엔테이션이 끝난 뒤에만 Level 3 빈칸을 채팅으로 냅니다.

## 전체 학습 흐름

학습은 작은 개념에서 실제 화면 흐름으로 올라갑니다.

1. 상태의 기본 감각: Session 1-3
2. 사용자 행동 처리: Session 4-6
3. 외부 세계와 동기화: Session 7-9
4. 계산과 라우팅: Session 10-11
5. 복합 상태 다루기: Session 12-13
6. 화면 분기와 목록: Session 14

## 한 세션의 상세 진행 순서

각 세션은 아래 순서를 지킵니다.

1. 진도 확인: `progress-check.md`에서 현재 세션 상태를 확인합니다.
2. 오리엔테이션: 개념, 문법, 키워드, 변수명, 데이터 흐름을 설명합니다.
3. 원본 연결: 실제 앱의 어느 파일과 연결되는지 짚습니다.
4. Level 3 빈칸 제시: 파일에 쓰지 않고 채팅으로만 냅니다.
5. 사용자 작성: 사용자가 해당 연습 파일에 직접 코드를 작성합니다.
6. 점검: Codex가 작성된 코드를 읽고 정답 대신 힌트와 수정 방향을 줍니다.
7. 재작성: 사용자가 같은 Level 3을 다시 작성합니다.
8. 말로 설명: 사용자가 핵심 흐름을 자기 말로 설명합니다.
9. 진도 갱신: 완료/복습필요/진행중 중 하나로 `progress-check.md`를 업데이트합니다.

## 완료 기준

세션은 아래 조건을 만족해야 완료로 표시합니다.

- 오리엔테이션을 들었다.
- Level 3 빈칸을 한 번 이상 직접 채웠다.
- 피드백을 반영했다.
- 다시 작성하거나 핵심 줄을 고쳤다.
- "이 state는 무엇을 기억하고, 이 handler/effect는 무엇을 하는가?"를 말로 설명했다.

조건 중 하나라도 불안하면 `완료`가 아니라 `복습필요`로 표시합니다.

## 막혔을 때 낮추는 순서

항상 Level 3에서 시작합니다. 막혔을 때도 바로 정답을 보여주지 않고 아래 순서로 힌트를 줍니다.

1. 변수명 힌트
2. 필요한 훅 이름 힌트
3. 타입 힌트
4. 한 줄 단위 구조 힌트
5. Level 2 빈칸
6. Level 1 빈칸

Level 1까지 내려간 뒤에도 이해가 안 되면, 같은 개념을 더 작은 예제로 다시 만듭니다.

## 세션 묶음별 목표

### 1단계: 상태와 입력

대상: Session 1-3

목표:

- state가 화면의 기억이라는 감각을 잡습니다.
- 입력 요소와 state가 서로 오가는 방향을 이해합니다.
- setter를 호출하면 컴포넌트가 다시 계산된다는 점을 말로 설명합니다.

### 2단계: 이벤트와 제출

대상: Session 4-6

목표:

- form 제출의 기본 동작을 막는 이유를 이해합니다.
- 비동기 요청 전후로 loading/message를 바꾸는 흐름을 익힙니다.
- 성공 후 라우팅 이동을 handler 안에서 호출하는 흐름을 익힙니다.

### 3단계: effect

대상: Session 7-9

목표:

- 렌더와 effect의 실행 시점을 구분합니다.
- 최초 1회 실행, cleanup, dependency 재실행을 분리해서 이해합니다.
- 오래된 비동기 응답을 무시하는 패턴을 익힙니다.

### 4단계: 파생값과 경로

대상: Session 10-11

목표:

- state로 저장할 값과 계산해서 얻을 값을 구분합니다.
- URL에서 온 값으로 새 글/수정 글 모드를 나누는 흐름을 이해합니다.

### 5단계: 복합 상태와 렌더링

대상: Session 12-14

목표:

- 객체 상태를 복사해서 안전하게 업데이트합니다.
- 배열 상태를 직접 변경하지 않고 새 배열로 갱신합니다.
- 로딩/빈 목록/목록 렌더링을 조건별로 나눕니다.

## Level 3 기준

Level 3은 가장 많이 비운 상태입니다.

비울 수 있는 것:

- state 변수명
- setter 변수명
- `useState` 초기값
- `useEffect` 본문
- dependency array
- event handler 본문
- `try/catch/finally`
- `value`, `onChange`, `disabled`

Codex는 정답 전체를 먼저 보여주지 않습니다. 사용자가 채운 뒤에 한 줄씩 점검합니다. Level 3 빈칸 코드는 파일에 미리 저장하지 않습니다.

## Level 3 제시 형식

처음 빈칸 코드는 완성 코드 뼈대에 `____`를 넣어 채팅으로만 제공합니다.

형식 규칙:

- 실제 코드 흐름 순서대로 제시합니다.
- 각 단계 앞에는 짧은 한국어 주석을 붙입니다.
- 빈칸 옆에는 `(a)`, `(b)` 같은 라벨과 "어떤 값/타입/함수?" 힌트를 붙입니다.
- `React가 정한 것`, `브라우저가 주는 것`, `사용자가 이름 짓는 것`이 헷갈리는 줄에는 짧게 표시합니다.
- 정답 전체나 긴 해설은 코드 아래에 붙이지 않습니다.

예시 형식:

```tsx
// 필요한 타입과 데이터를 가져온다
import type { ____ } from "../types/post";       // (a) 어떤 타입?
import { ____ } from "./mockData";               // (b) 어떤 데이터?

export ____ function fetchPosts(                 // (c) 비동기 키워드
  params?: { q?: string; tag?: string; cursor?: string }
): ____<{ items: Post[]; nextCursor?: string }> { // (d) 반환을 감싸는 상자 타입
  // 1) 네트워크 지연 흉내
  await new ____((resolve) => ____(resolve, 300)); // (e) 상자 종류 (f) 시간 예약 함수

  // 2) 원본 목록에서 시작
  let result = ____;                              // (g) 어떤 배열?

  // 3) 검색어가 있으면 title에 그 글자가 들어간 것만 남긴다
  if (params?.q) {
    result = result.____((post) =>                // (h) 거르는 메서드
      post.title.____(params.q!)                  // (i) 포함 확인 메서드
    );
  }

  // 4) 계약 모양 객체로 돌려준다
  return { items: ____, nextCursor: undefined };  // (j) 무엇을 담아 반환?
}
```

## Session 1: `useState` 텍스트 값

파일: `01-use-state-text.tsx`

원본: `../src/pages/LoginPage.tsx`

핵심 개념:

- `useState`
- 문자열 state
- setter
- 렌더링과 재계산

직접 채울 것:

- 텍스트 state 하나
- input 값 표시
- 버튼으로 초기화

## Session 2: `useState` boolean 값

파일: `02-use-state-boolean.tsx`

원본: `../src/pages/SignupPage.tsx`

핵심 개념:

- boolean state
- checkbox
- toggle
- 조건부 문구

직접 채울 것:

- `agree`
- `checked`
- `event.target.checked`
- 동의 여부 표시

## Session 3: controlled input

파일: `03-controlled-input.tsx`

원본: `../src/pages/LoginPage.tsx`

핵심 개념:

- 입력값의 주인이 React state가 되는 구조
- `value`
- `onChange`
- `event.target.value`

직접 채울 것:

- email input
- password input
- 입력값 미리보기

## Session 4: form submit event

파일: `04-form-submit-event.tsx`

원본: `../src/pages/LoginPage.tsx`, `../src/pages/PostListPage.tsx`

핵심 개념:

- `FormEvent<HTMLFormElement>`
- `event.preventDefault()`
- 입력 중인 값과 제출된 값 분리

직접 채울 것:

- `keyword`
- `submittedKeyword`
- `handleSubmit`

## Session 5: async submit과 loading

파일: `05-async-submit-loading.tsx`

원본: `../src/pages/LoginPage.tsx`, `../src/pages/PostEditorPage.tsx`

핵심 개념:

- `async/await`
- `try/catch/finally`
- loading state
- error message state

직접 채울 것:

- `isSubmitting`
- `message`
- 요청 전/성공/실패/마지막 정리

## Session 6: 성공 후 navigate

파일: `06-navigate-after-success.tsx`

원본: `../src/pages/LoginPage.tsx`, `../src/pages/PostEditorPage.tsx`

핵심 개념:

- `useNavigate`
- 성공 이후 화면 이동
- handler 안에서 라우터 함수 호출

직접 채울 것:

- `navigate`
- 저장 성공 후 이동 경로

## Session 7: mount effect

파일: `07-effect-on-mount.tsx`

원본: `../src/pages/PostEditorPage.tsx`

핵심 개념:

- `useEffect`
- mount 이후 실행
- dependency array `[]`

직접 채울 것:

- 최초 1회 데이터 불러오기
- fallback state

## Session 8: cleanup effect

파일: `08-effect-cleanup-event.tsx`

원본: `../src/components/Header.tsx`

핵심 개념:

- browser event listener
- effect cleanup
- 같은 함수 참조로 등록/해제

직접 채울 것:

- `syncUser`
- `addEventListener`
- `removeEventListener`

## Session 9: dependency effect

파일: `09-effect-dependencies.tsx`

원본: `../src/pages/PostListPage.tsx`

핵심 개념:

- dependency array
- 검색어/필터/page 변화에 따른 재요청
- stale response 무시

직접 채울 것:

- `page`
- `postType`
- `submittedKeyword`
- `ignore`

## Session 10: useMemo derived value

파일: `10-use-memo-derived-value.tsx`

원본: `../src/pages/PostListPage.tsx`

핵심 개념:

- 원본 state와 파생값 구분
- `useMemo`
- dependency

직접 채울 것:

- `selectedCategory`
- `categories.find`

## Session 11: route param과 edit mode

파일: `11-route-param-edit-mode.tsx`

원본: `../src/pages/PostEditorPage.tsx`

핵심 개념:

- `useParams`
- `Boolean(postId)`
- 새 글/수정 글 분기

직접 채울 것:

- `postId`
- `isEdit`
- 수정 모드일 때만 불러오기

## Session 12: object state update

파일: `12-object-state-update.tsx`

원본: `../src/pages/PostEditorPage.tsx`

핵심 개념:

- object state
- 이전 state 보존
- computed property name

직접 채울 것:

- `form`
- `setForm((current) => ...)`
- `[key]: value`

## Session 13: array toggle state

파일: `13-array-toggle-state.tsx`

원본: `../src/pages/PostEditorPage.tsx`

핵심 개념:

- array state
- `includes`
- `filter`
- spread syntax
- 최대 개수 제한

직접 채울 것:

- 태그 선택/해제
- 최대 8개 제한

## Session 14: conditional list render

파일: `14-conditional-list-render.tsx`

원본: `../src/pages/PostListPage.tsx`, `../src/pages/PostDetailPage.tsx`

핵심 개념:

- `map`
- `key`
- empty state
- loading state
- message state

직접 채울 것:

- 로딩 문구
- 빈 목록 문구
- 목록 렌더링

## 반복 규칙

각 세션은 3번 반복합니다.

1. 오리엔테이션을 들은 뒤 Level 3 빈칸 채우기
2. 힌트만 받고 다시 Level 3 채우기
3. 코드 한 줄마다 말로 설명하면서 Level 3 채우기
