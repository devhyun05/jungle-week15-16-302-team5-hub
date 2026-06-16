# RAG 구현 학습 문서

이 문서는 JungleLog의 RAG 기능을 구현하면서 업데이트한다.

## RAG란?

RAG는 Retrieval-Augmented Generation의 약자다.

LLM이 답변을 만들기 전에 우리 서비스의 데이터를 먼저 검색하고, 검색된 자료를 근거로 답변을 생성하는 구조다.

## JungleLog에서 RAG가 필요한 이유

JungleLog의 AI는 단순히 일반적인 포트폴리오 문장을 만드는 것이 아니라, 사용자가 실제로 작성한 기록을 근거로 글을 만들어야 한다.

검색 대상 후보:

- 학습 로그
- 트러블슈팅
- 프로젝트 회고
- 면접 질문
- 포트폴리오 프로젝트
- GitHub README
- GitHub 커밋 메시지

## 구현 예정 순서

1. 게시글/포트폴리오/GitHub 자료를 embedding 대상으로 정리한다.
2. PostgreSQL pgvector 또는 별도 vector DB를 선택한다.
3. 텍스트를 embedding으로 변환해 저장한다.
4. AI 생성 요청 시 관련 자료를 유사도 검색한다.
5. 검색 결과를 OpenAI prompt context에 포함한다.

## 현재는 왜 아직 RAG가 아닌가?

초기 AI 단계에서는 선택된 프로젝트 자료를 직접 context로 넣는다.

이 방식은 RAG라기보다 “직접 context 주입”이다. 이후 데이터가 많아지면 모든 자료를 넣기 어렵기 때문에, 그때 RAG 검색이 필요해진다.

## 이번 구현에서 볼 키워드

- embedding
- vector DB
- pgvector
- similarity search
- retrieval
- context window
- chunking
- top-k

