# Architecture Notes

## Current Scope

This document will track how the board, RAG, MCP, and Agent features are designed.

## Initial Separation

- Frontend: React screens, routing, UI state, and API calls
- Backend: FastAPI routes, services, repositories, database access, and AI integrations
- Database: PostgreSQL for relational board data, with pgvector planned for RAG

