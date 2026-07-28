# React Hooks Practice

이 폴더는 현재 React 앱의 핵심 훅 패턴을 손으로 치기 위한 연습 공간입니다.

별도 RAG/MCP 전용 페이지는 없고 Agent 화면으로 통합되었습니다. 연습은 인증, 게시글 목록/작성/상세, Agent 화면에서 쓰이는 핵심 훅 패턴 중심으로 진행합니다.

연습용 `*.tsx` 파일에는 코드 빈칸을 넣지 않습니다. 파일에는 세션 목표를 설명하는 주석만 둡니다. 실제 빈칸 문제는 매 세션마다 Codex가 채팅으로 냅니다.

## 진행 방식

1. 세션을 시작하기 전에 Codex가 오리엔테이션을 먼저 합니다.
2. 오리엔테이션에서는 개념, 문법, 키워드, 변수명, 데이터 흐름을 자세히 설명합니다.
3. 그 다음 주석-only 세션 파일 하나를 엽니다.
4. Codex가 채팅으로 Level 3 빈칸 문제를 냅니다.
5. 사용자가 실제 파일에 코드를 직접 작성합니다.
6. Codex가 답을 바로 주지 않고, 사용자의 작성분을 읽고 필요한 힌트를 줍니다.

## 빈칸 레벨

- Level 1: 핵심 표현만 비웁니다.
- Level 2: 훅 호출과 handler 일부를 비웁니다.
- Level 3: 변수명, 훅 호출, dependency, handler 본문까지 많이 비웁니다.

항상 Level 3에서 시작합니다. 쉬운 레벨은 사용자가 요청할 때만 내려갑니다. 단, Level 3 빈칸은 파일에 저장하지 않고 Codex가 세션 중 채팅으로 제공합니다.

## 추천 순서

1. `01-use-state-text.tsx`
2. `02-use-state-boolean.tsx`
3. `03-controlled-input.tsx`
4. `04-form-submit-event.tsx`
5. `05-async-submit-loading.tsx`
6. `06-navigate-after-success.tsx`
7. `07-effect-on-mount.tsx`
8. `08-effect-cleanup-event.tsx`
9. `09-effect-dependencies.tsx`
10. `10-use-memo-derived-value.tsx`
11. `11-route-param-edit-mode.tsx`
12. `12-object-state-update.tsx`
13. `13-array-toggle-state.tsx`
14. `14-conditional-list-render.tsx`

## 원본 매칭

- 인증/세션: `../src/components/Header.tsx`, `../src/pages/LoginPage.tsx`, `../src/pages/SignupPage.tsx`
- 게시글 목록: `../src/pages/PostListPage.tsx`
- 게시글 작성/수정: `../src/pages/PostEditorPage.tsx`
- 게시글 상세: `../src/pages/PostDetailPage.tsx`
- Agent 요청/결과: `../src/pages/AgentDiagnosisPage.tsx`
