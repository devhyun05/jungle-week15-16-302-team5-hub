# contexts

React 전역 상태를 관리하는 폴더입니다.

현재 사용 중인 핵심 context:

- `AuthContext.tsx`: 앱 시작 시 `/auth/me`를 호출해 현재 로그인 사용자, role, approvalStatus를 관리합니다.
- Google 로그인 시작은 `loginWithGoogle()`에서 `/auth/google/login`으로 이동합니다.
- 로그아웃은 `/auth/logout` API를 호출한 뒤 사용자 상태를 비웁니다.

현재 role과 승인 상태는 mock state가 아니라 백엔드 인증 API 응답을 기준으로 처리합니다.