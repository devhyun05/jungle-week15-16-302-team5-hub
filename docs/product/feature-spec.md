# Feature Spec

## Product Concept

GlowBoard is a global beauty and fashion topic community.

The product is not a generic free-form board. Each post is a focused topic where users discuss one beauty or fashion question, product, routine, trend, styling idea, or external content link.

Example topics:

- "Best lightweight sunscreen for oily skin in humid summer"
- "K-beauty lip tint recommendations for warm undertones"
- "French pharmacy skincare products worth trying"
- "How are people styling silver flats this season?"
- "Is this viral serum actually useful for sensitive skin?"

The product planning must not reduce the assignment scope. All required board, AI, architecture, testing, and documentation items remain in scope. This document only gives the required features a clearer product theme.

## Core User Value

- Help global users share beauty and fashion information across languages.
- Keep each conversation focused by making one post equal one topic.
- Use AI to reduce language barriers and help users find related discussions.
- Use external content metadata so links to products, articles, or videos become useful discussion material.

## Content Model

### Boards and Categories

GlowBoard uses fixed or admin-seeded category boards:

- Skincare
- Makeup
- Hair
- Fashion
- Trends
- Product Reviews

Each board contains topic posts. A user can browse all topics or filter by board.

### Topic Post

A post represents one topic only.

Required post fields:

- Title
- Body
- Board/category
- Original language
- Author
- Tags
- Created and updated timestamps

Optional post fields:

- Region or country context
- Skin type or style context
- Product or brand name
- Source URL
- Image URL

Post rules:

- The title should describe one specific discussion topic.
- The body should stay attached to that topic.
- If a user wants to discuss a different question, they should create another post.

### Comments

Comments are used for discussion, answers, reviews, and follow-up questions.

Comment fields:

- Body
- Original language
- Author
- Post
- Created and updated timestamps

## Required User Features

Current MVP status after Day 2:

- Auth, posts CRUD, comments CRUD, tags, search, pagination, Zustand auth state,
  cookie refresh auth, CSRF for refresh/logout, and Redis comment rate limit are implemented.
- AI, GraphQL, SSR, realtime, worker queue, pgvector/RAG, MCP, and Agent features remain in later phases.

### Authentication

- Sign up
- Log in
- Log out
- Current user lookup
- Passwords stored as hashes
- Backend authorization checks for protected actions

### Topic Board

- Create post
- Read post list
- Read post detail
- Update own post
- Delete own post
- Search posts by keyword
- Filter posts by tag
- Paginate post list
- Browse by board/category

### Comments

- Add comment to a topic
- Read comments on a topic
- Delete own comment
- Keep comment authorization checks on the backend

### Tags

- Create or reuse tags
- Attach tags to posts
- Use tags for discovery and filtering

### Frontend States

- Loading state
- Error state
- Empty state
- Protected route state
- AI-running state

## AI Features

### Automatic Translation

Purpose:

- Let users read posts and comments written in other languages.

Behavior:

- A user can request translation for a post or comment.
- Translation output should preserve the original meaning and show the target language.
- The original text remains stored as the source of truth.

Implementation notes:

- Use a commercial LLM API.
- Do not hard-code API keys.
- Cache repeated translation results when practical.

### RAG: Related Topics and Beauty Q&A

Purpose:

- Use existing board data as the main knowledge source.

Behavior:

- When viewing a topic, show similar topics based on embeddings.
- When asking a question, retrieve relevant topic posts and comments, then generate an answer with source links.
- The answer should cite or reference the posts used as context.

Data source:

- GlowBoard posts
- GlowBoard comments
- Tags and board/category metadata

Implementation notes:

- Store embeddings in PostgreSQL with pgvector.
- Use a job queue for embedding generation.
- Return related topic IDs, titles, summaries, and similarity scores where useful.

### MCP: External Beauty Content Tool

Purpose:

- Connect topic discussions to real external content.

Tool candidate:

- `fetch_url_metadata(url)`

Behavior:

- A user can paste a product page, article, or video URL into a post.
- The MCP server fetches title, description, site name, image metadata, and canonical URL when available.
- The backend stores or displays the metadata as a source preview for the topic.

Implementation notes:

- MCP server uses JSON-RPC request/response.
- At least one real external service or external URL must be called.
- API keys and permission strategy must be documented if the selected tool needs keys.
- Tool calls need timeout and error handling.

### Agent: Topic Curator Agent

Purpose:

- Let an AI agent choose tools and produce a useful topic-focused response.

Behavior:

- User asks for help on a topic, for example: "Find related sunscreen discussions and summarize the main recommendations."
- Agent checks intent.
- Agent can call RAG related topic search.
- Agent can call the MCP external metadata tool when a source URL is involved.
- Agent can generate a final answer with a short summary and referenced sources.

Guardrails:

- Agent must have a max step limit.
- Agent state must track tool calls and intermediate results.
- Agent must handle tool failure with a fallback response.

## Technical Scope Mapping

The product theme must still include the required technical scope:

- React and TypeScript frontend
- Zustand state management
- Tailwind UI
- FastAPI backend
- REST APIs
- GraphQL endpoint
- CSR main app
- SSR preview route
- WebSocket feature
- SSE progress events
- PostgreSQL relational schema
- pgvector embeddings
- Redis for rate limit, cache, or AI/job status
- RabbitMQ job queue with worker
- RAG feature
- JSON-RPC MCP server with an external tool
- Agent workflow with tool selection and step limit
- Backend error handling, logging, configuration, and tests
- Frontend component/store tests and at least one E2E scenario

## Non-Reduction Rule

If implementation time becomes tight, features may be implemented in a thin but working form first. They must not be removed from the plan, deleted from the checklist, or redefined as optional if they are part of `docs/requirements.md`.

## Product Quality Checklist

상용 수준에 가까운 결과물을 만들기 위해 각 기능은 정상 동작만이 아니라 상태와 실패 처리를 함께 구현한다.

### Board Quality

- [ ] 목록은 검색어, 태그, board/category, page 상태를 URL 또는 Zustand와 일관되게 관리한다.
- [ ] 목록에는 loading, empty, error 상태가 있다.
- [ ] 상세 화면은 삭제된 글이나 없는 글에 대한 404 상태가 있다.
- [ ] 작성/수정 form은 validation error를 화면에 보여준다.
- [ ] 수정/삭제 버튼은 owner에게만 보이지만, backend 권한 검사도 반드시 수행한다.
- [ ] 댓글 작성 실패와 삭제 실패가 사용자에게 보인다.

### AI Quality

- [ ] RAG 답변은 source post를 포함한다.
- [ ] 관련 source가 부족하면 답변에서 부족하다고 말한다.
- [ ] LLM key가 없거나 실패할 때 mock/fallback이 있다.
- [ ] MCP tool 실패는 원본 URL이나 사용자 입력을 잃지 않는다.
- [ ] Agent는 max step을 넘기면 안전하게 종료한다.
- [ ] Agent trace는 어떤 tool을 호출했는지 보여준다.

### UX Quality

- [ ] 모든 input에는 label이 있다.
- [ ] 버튼은 loading/disabled 상태를 표현한다.
- [ ] keyboard focus가 보인다.
- [ ] 에러 메시지는 사용자가 다음 행동을 알 수 있게 쓴다.
- [ ] 모바일에서 주요 action이 화면 밖으로 밀리지 않는다.

### Documentation Quality

- [ ] 구현한 기능은 README에 설명한다.
- [ ] 요구사항 강조 키워드는 실제 구현 위치를 README 또는 관련 문서에 기록한다.
- [ ] 구현하지 못한 깊이 있는 개선점은 limitations 문서에 솔직하게 적는다.
