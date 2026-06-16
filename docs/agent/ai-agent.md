# AI Agent 구현 학습 문서

이 문서는 JungleLog의 AI Agent 기능을 구현하면서 업데이트한다.

## Agent란?

Agent는 LLM이 단순히 답변만 만드는 것이 아니라, 목표를 해결하기 위해 필요한 도구를 선택하고 실행하는 구조다.

## JungleLog에서 Agent가 할 일

예상 기능:

- 포트폴리오 글 작성을 위해 필요한 자료를 스스로 고른다.
- GitHub 정보가 부족하면 GitHub tool을 호출한다.
- 관련 학습 기록이 필요하면 RAG 검색 tool을 호출한다.
- 결과를 포트폴리오 글이나 면접 질문으로 정리한다.

## 초기 Agent 설계

입력:

- 사용자 요청
- 선택한 프로젝트 id
- 생성 유형

사용 가능한 tool 후보:

- 프로젝트 조회
- 게시글 검색
- GitHub README 조회
- GitHub 커밋 조회
- 포트폴리오 글 저장

종료 조건:

- 최대 반복 횟수 도달
- 필요한 자료 수집 완료
- 오류 발생

## 왜 마지막에 구현하는가?

Agent는 OpenAI 호출, RAG 검색, MCP tool이 어느 정도 준비되어야 의미가 있다.

그래서 구현 순서는 다음처럼 간다.

1. OpenAI 단일 호출
2. RAG 검색 연결
3. MCP tool 연결
4. Agent 추론 루프

## 이번 구현에서 볼 키워드

- function calling
- tool calling
- reasoning loop
- state
- memory
- max iterations
- timeout
- exception handling

