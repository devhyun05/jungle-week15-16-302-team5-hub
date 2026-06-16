# User Flow

## User Flow Overview

GlowBoard is designed around focused topic discussions. A user lands on a beauty or fashion board, opens a topic post, reads the original discussion or a translated version, comments, and uses AI to discover related topics or external content context.

## Anonymous User Flow

1. User opens the topic list.
2. User browses all topics or selects a board such as Skincare, Makeup, Hair, Fashion, Trends, or Product Reviews.
3. User searches by keyword, filters by tag, and moves through paginated results.
4. User opens a topic detail page.
5. User reads the post, tags, source preview, related topics, and comments.
6. User can request translation for visible post or comment text if the UI allows public AI actions.
7. User is prompted to log in when trying to create a post, comment, or run protected AI actions.

## Sign Up and Login Flow

1. User opens the sign up page.
2. User enters email, display name, and password.
3. Backend hashes the password and creates the user.
4. User logs in.
5. Backend returns an access token and records session state.
6. Frontend stores access token, current user id, and current user role with Zustand.
7. App startup or token changes sync the current user role from `/api/auth/me`.
8. Protected routes and actions become available.
9. Admin navigation appears only when the current user role is `admin`.

## Topic Creation Flow

1. Logged-in user clicks create topic.
2. User selects a board/category.
3. User writes one focused title.
4. User writes body text for that single topic.
5. User selects original language.
6. User adds tags such as `sunscreen`, `oily-skin`, `lip-tint`, `street-style`, or `k-beauty`.
7. User optionally adds region, skin type, style context, product/brand, image URL, or source URL.
8. Backend validates ownership and request shape.
9. Backend creates the post and tag relationships in a transaction.
10. Backend enqueues an embedding job.
11. User is redirected to the topic detail page.

## Topic Detail and Discussion Flow

1. User opens a topic.
2. Frontend fetches post detail, tags, comments, related topics, and source metadata if available.
3. User reads the original post.
4. User requests translation when the original language differs from their preferred language.
5. User reads comments.
6. Logged-in user adds a comment.
7. Backend saves the comment and enqueues embedding or update work if needed.
8. Realtime or refreshed UI shows new discussion activity.

## Search and Discovery Flow

1. User enters a keyword such as "barrier cream" or "silver flats".
2. User optionally selects board, tag, language, or region filters.
3. Backend returns paginated posts.
4. User opens a topic.
5. Similar topics are shown through RAG/vector search.

## MyPage Flow

1. Logged-in user opens My Page.
2. Frontend calls `/api/users/me/activity`.
3. Backend uses the access token to identify the current user.
4. Backend returns the current user profile, visible posts written by the user, and visible comments written by the user.
5. Deleted or admin-hidden posts/comments are excluded.
6. Frontend shows loading, error, and empty states for the activity lists.

## Admin Moderation Flow

1. Admin user logs in.
2. Frontend syncs the current user role and shows the Admin navigation link.
3. Admin opens the moderation page.
4. Frontend calls `/api/admin/posts` and `/api/admin/comments`.
5. Backend verifies `users.role = "admin"` through `require_admin`.
6. Admin sees visible and hidden posts/comments, excluding author-deleted content.
7. Admin hides or restores a post/comment.
8. Backend updates `hidden_at`, `hidden_by_id`, and `hidden_reason`.
9. Backend writes a compact row to `admin_action_logs`.
10. Public post/comment views exclude hidden content.

## RAG Flow

1. User opens a topic or asks a beauty/fashion question.
2. Backend builds a retrieval query from the topic title, body, tags, and user question.
3. pgvector search retrieves relevant posts and comments.
4. Backend sends retrieved context to the selected commercial LLM.
5. LLM returns a concise answer, summary, or related topic explanation.
6. Response includes references to source topic posts.
7. Frontend shows loading, success, and error states.

## MCP External Content Flow

1. User adds a source URL to a topic.
2. Backend sends a JSON-RPC request to the MCP server.
3. MCP tool fetches external URL metadata.
4. MCP server returns title, description, site name, image metadata, and canonical URL when available.
5. Backend stores or returns the metadata.
6. Frontend displays the source preview on the topic page.
7. If the external call fails, the original URL remains visible and the UI shows a recoverable error.

## Agent Flow

1. User asks the Topic Curator Agent for help inside a topic.
2. Agent initializes state with user question, topic ID, max step count, and available tools.
3. Agent checks whether it needs board retrieval, external source metadata, translation, or a direct answer.
4. Agent calls RAG search for related GlowBoard topics.
5. Agent calls MCP metadata when the topic includes an external URL.
6. Agent summarizes results and returns a final topic-focused response.
7. SSE sends progress events to the frontend while the agent runs.
8. The agent stops when it reaches a final answer or the max step limit.

## Owner Edit and Delete Flow

1. Logged-in user opens their own topic or comment.
2. UI shows edit/delete actions only when the user is the owner.
3. Backend still checks authorization for every protected request.
4. User updates or deletes the resource.
5. Delete preserves the row by setting `deleted_at`.
6. Public list/detail/comment lookups exclude deleted content.
7. UI refreshes the topic list or detail page.

## Demo Flow

1. Sign up and log in.
2. Create a Skincare topic about sunscreen.
3. Add tags and a source URL.
4. Show the post detail page.
5. Add a comment in another language.
6. Open My Page and show visible own activity.
7. Log in as or seed an admin user.
8. Open AdminPage and hide/restore a post or comment.
9. Translate the comment.
10. Show similar topics from RAG.
11. Run the Topic Curator Agent.
12. Show MCP source preview.
13. Show README architecture summary and test result.

## Day 1 MVP Screen Memo

Day 1 화면 메모는 예쁜 디자인보다 입력값, 사용 행동, 상태, 필요한 API를 확인하기 위한 초안이다.
댓글, 태그, 검색, 페이징, AI 패널은 Day 2 이후에 붙인다.

### Login

```text
입력값:
- email
- password

버튼/행동:
- 로그인 버튼을 누르면 login API를 호출한다.
- 회원가입 링크를 누르면 Signup 화면 또는 signup form으로 이동한다.
- 로그인 성공 시 Post List로 이동한다.

상태:
- loading: 로그인 요청을 보내는 중
- error: 로그인 정보가 올바르지 않습니다
- empty: 별도 empty 상태 없음

필요 API:
- POST /api/auth/login
```

### Post List

```text
입력값:
- Day 1에서는 없음
- 검색어 입력은 화면에 둘 수 있지만 실제 검색 연결은 Day 2에서 한다

버튼/행동:
- 게시글 제목을 누르면 Post Detail로 이동한다.
- 글쓰기 버튼을 누르면 Post Form으로 이동한다.
- 로그인하지 않은 사용자가 글쓰기 버튼을 누르면 Login으로 이동한다.

상태:
- loading: 게시글 목록을 불러오는 중
- error: 게시글을 불러오지 못했습니다
- empty: 아직 게시글이 없습니다

필요 API:
- GET /api/posts
```

### Post Detail

```text
입력값:
- 없음

버튼/행동:
- 뒤로 가기 버튼을 누르면 Post List로 이동한다.
- 작성자일 때만 수정 버튼과 삭제 버튼을 보여준다.
- 수정 버튼을 누르면 Post Form 수정 모드로 이동한다.
- 삭제 버튼을 누르면 delete API를 호출하고 성공 시 Post List로 이동한다.

상태:
- loading: 게시글 상세를 불러오는 중
- error: 게시글을 불러오지 못했습니다
- empty: 게시글이 없거나 삭제되었습니다

필요 API:
- GET /api/posts/{post_id}
- DELETE /api/posts/{post_id}
```

### Post Form

```text
입력값:
- title
- body

버튼/행동:
- 저장 버튼을 누르면 작성 모드에서는 create API를 호출한다.
- 저장 버튼을 누르면 수정 모드에서는 update API를 호출한다.
- 취소 버튼을 누르면 이전 화면으로 돌아간다.

상태:
- loading: 기존 글을 불러오는 중 또는 저장 중
- error: 저장하지 못했습니다
- empty: 수정 모드에서 기존 글을 찾을 수 없습니다
- validation: title 또는 body가 비어 있으면 저장하지 않는다

필요 API:
- POST /api/posts
- GET /api/posts/{post_id}
- PUT /api/posts/{post_id}
```

## Wireframe Drafts

와이어프레임은 구현 전에 화면의 정보 구조를 확인하기 위한 초안이다. 실제 UI 구현 중 바뀌면 이 섹션을 같이 수정한다.

### Topic List

```text
Header: GlowBoard | Search | User/Login
Board Tabs: All, Skincare, Makeup, Hair, Fashion, Trends, Reviews

Search row:
[keyword input] [tag filter] [Search]

Topic list:
- topic title
- board, author, created_at
- tags
- short preview

Pagination:
[Prev] page / total [Next]

Primary action:
[Create Topic]

States:
- loading: list skeleton
- empty: no topics found
- error: retry
- permission: create button sends anonymous user to login
```

### Topic Detail

```text
Header

Title
Meta: board, author, language, created_at
Tags
Source Preview
Body

Owner actions:
[Edit] [Delete]

AI actions:
[Similar Topics] [Ask RAG] [Run Agent]

Similar Topics
Comments
Comment Form

States:
- loading topic
- missing topic 404
- no comments
- AI running
- external source metadata failed
```

### Create/Edit Topic

```text
Form:
[Board select]
[Title input]
[Body textarea]
[Original language select]
[Tags input]
[Source URL input]

Actions:
[Cancel] [Save]

States:
- validation error
- saving
- unauthorized
```

### Auth

```text
Login:
[Email]
[Password]
[Log in]
[Go to signup]

Signup:
[Email]
[Display name]
[Password]
[Create account]

States:
- wrong password
- duplicate email
- access token expires, refresh cookie + CSRF flow restores a new access token once
- logout clears frontend auth state and revokes the backend refresh session
```

### AI Q&A

```text
Question input
[Ask]

Answer panel:
- answer
- source posts
- used mock/API flag if useful for development

States:
- loading
- no relevant sources
- LLM unavailable fallback
```

### MCP Tool

```text
Tool select
Input fields
[Run Tool]

Result:
- JSON result preview
- external source note

States:
- invalid params
- external timeout
- tool unavailable
```

### Agent

```text
Question input
[Run Agent]

Progress trace:
- started
- intent_check
- tool_call
- tool_result
- generate_answer
- done

Final answer
Sources/tool calls

States:
- max_steps reached
- tool error fallback
- SSE disconnected
```
