# AGENTS.md

## Learning Coach Entry Point

This repository can be worked on in two modes:

- **Implementation mode:** build the next small working slice.
- **Learning coach mode:** teach the concept first, then guide the user through fill-in-the-blank drills.

When the user asks to learn, practice, drill, review basics, or continue a study session, read these files first:

- `docs/learning/진도_체크포인트.md`
- `docs/learning/GLOWBOARD_학습코치_AGENT.md`
- `docs/learning/GLOWBOARD_학습_단계별_가이드.md`

Additional learning or work-check topics should be added directly to the matching Day in `docs/planning/index.html` and `docs/learning/GLOWBOARD_학습_단계별_가이드.md`, not kept in a separate candidate file.

`docs/planning/index.html` is the user-facing detailed schedule. It is intentionally more detailed than the learning md files because the user studies from it. The learning md files are AI-agent-facing handoff and judgment documents: use them to find the current Day/block and completion criteria, then consult the matching Day in `docs/planning/index.html` for detailed learning notes, work order, implementation references, manual checks, and stop criteria.

### Learning Session Rules

- Start each learning session by checking `docs/learning/진도_체크포인트.md`.
- Match the checkpoint Day/block with the corresponding section in `docs/planning/index.html` before starting implementation or drills.
- Judge progress by working behavior, tests, and the checkpoint, not by file existence alone.
- Prefer concept -> design options -> decision -> drill -> check -> small implementation.
- Before each meaningful implementation slice, pause for a short design choice checkpoint: compare 2-3 reasonable options, learn the minimum concept needed to choose, record the chosen option and reason, then implement.
- Do not paste a full solution when the user is practicing, unless the user asks for the answer or the third hint has failed.
- After each completed stage, update the checkpoint in a small, factual way.
- If the user explicitly asks for implementation rather than a lesson, implement normally while keeping explanations concise.

## Project Overview

This project is a 2-week individual assignment to build a board-based AI web application.

The first milestone is to build a working board MVP with React, FastAPI, and PostgreSQL. After the MVP is stable, AI features will be designed and added step by step.

## Current Strategy

- Build the board MVP first.
- Keep planning lightweight and implementation-focused.
- Decide the product concept clearly enough to guide implementation, but keep AI implementation incremental.
- Use documents in `docs/` as living notes while building.
- Summarize the final result in `README.md`.

## Scope and Requirements Rules

- Do not reduce or remove assignment scope to fit the schedule.
- Treat `docs/requirements.md` as immutable original assignment requirements.
- Do not edit, rewrite, summarize over, or "clean up" `docs/requirements.md`.
- Planning documents may organize order, priority, and implementation sequence, but they must not redefine the required deliverables.
- If time is tight, move work to the next implementation step and record the risk; do not delete the requirement from the plan.
- When product planning choices are needed, choose a theme that satisfies the full assignment scope rather than narrowing the assignment.

## Product Direction

- Product theme: a global beauty and fashion topic community.
- Working name: GlowBoard.
- One post should focus on one topic only.
- A topic can be a beauty question, product review, routine, trend, styling idea, or external content discussion.
- The board experience should support global users sharing posts, comments, tags, search, paging, and AI-assisted discovery.
- AI features should connect directly to topic posts and comments through translation, related topic retrieval, external content metadata, and an agent workflow.

## Tech Stack

- Frontend: React
- Backend: FastAPI
- Database: PostgreSQL
- Vector Search: pgvector
- AI: Commercial LLM API, to be decided
- MCP: JSON-RPC based MCP Server, details to be decided

## Development Rules

- Learn only the parts needed for the current implementation step.
- For non-trivial choices, design first: identify options, compare trade-offs, choose explicitly, and record the reason before writing code.
- Prioritize small working features over broad unfinished designs.
- Do not start RAG before the board MVP is working.
- Do not start MCP before the RAG direction is clear.
- Do not start Agent implementation before the available tools are clear.
- Avoid unnecessary refactoring while the MVP is still incomplete.
- Keep authentication, authorization, and database relationships explicit.

## Backend Rules

- Organize FastAPI routes by feature.
- Separate SQLAlchemy models from Pydantic schemas.
- Run authorization checks on the backend.
- Store passwords as hashes, never as plain text.
- Keep API response shapes reasonably consistent.

## Frontend Rules

- Separate pages from reusable components.
- Keep API call logic organized in a predictable location.
- Show loading, error, and empty states for user-facing flows.
- Prefer usable UI over decorative design during MVP development.

## AI Feature Rules

AI feature direction is tied to the GlowBoard topic community, while implementation details should be finalized in the matching design document before each AI feature is built.

Before implementing each AI feature, update the matching design document:

- RAG: `docs/ai/rag-design.md`
- MCP: `docs/ai/mcp-design.md`
- Agent: `docs/ai/agent-design.md`

For now, follow only these constraints:

- AI features must connect to the board experience.
- RAG should use board data as its main knowledge source.
- MCP should connect to at least one real external service.
- Agent behavior should have a clear step limit to prevent infinite loops.
- Do not hard-code API keys or secrets.

## Documentation Rules

- Do not try to finish every document before implementation.
- Update related documents in small increments after each feature.
- Keep `docs/requirements.md` as the original assignment requirements.
- Keep `docs/planning/index.html` as the current working schedule unless a markdown schedule is created later.
- Use `README.md` as the final submission summary.

## Commands

Fill these in after the project structure is created.

- Frontend dev:
- Backend dev:
- Test:
- DB migration:

## Security

- Do not commit `.env` files.
- Do not write API keys directly in source code.
- Use environment variables for secrets.
- Agents must not read real secret files such as `.env` unless the user explicitly asks for that exact file.
- Prefer `.env.example`, masked values, and "loaded/not loaded" checks when helping with environment setup.
- Before final submission or deployment, rotate or replace any development DB passwords, JWT secrets, and API keys that may have been shared or exposed during development.
