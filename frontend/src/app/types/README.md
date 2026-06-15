# types

프론트엔드 공통 TypeScript 타입을 분리할 때 사용하는 폴더입니다.

현재는 화면별 API 타입이 각 `api/*.ts` 파일에 함께 정의되어 있습니다. 예를 들어 게시글 응답 타입은 `api/posts.ts`, 포트폴리오 응답 타입은 `api/portfolio.ts`에 있습니다.

카테고리 UI 상수는 `constants/categories.ts`에 있고, 게시글/포트폴리오/코치 리뷰 핵심 화면은 실제 API 타입을 사용합니다.

나중에 여러 API에서 공유하는 타입이 커지면 이 폴더로 분리합니다.