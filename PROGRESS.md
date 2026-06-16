# Progress

Status of each section of the implementation guide. Updated as each section closes.

Legend: not started, in progress, done.

| # | Section | Status | Notes |
|---|---------|--------|-------|
| 1 | Foundation and Infrastructure | done | monorepo, db schema (21 tables), shared contracts, infra, eval harness; migrate + seed verified on live pgvector |
| 2 | Design System and Shared UI | done | tokens, preset, fonts, 22 primitives, motion, brand, command surface; console scaffold + /preview renders all |
| 3 | Authentication, Organizations, API Keys | done | auth.js (credentials + optional github), org bootstrap, org scoping, secret keys (reveal once) + embed tokens + origin allowlist, settings; cross tenant isolation tested on live db |
| 4 | Marketing Site | done | nav with auth aware Open app handoff, footer, home hero (command surface preview), how it works, use cases, pricing, docs shell; all build and route |
| 5 | App Shell and Navigation | done | sidebar with agent switcher + per agent nav, top bar with breadcrumbs and account menu, agents overview + create flow, all 8 tab routes (stubs for later sections), settings in shell |
| 6 | Agent Core (runtime and verbs) | done | provider abstraction (stub default + claude/openai), tool registry, orchestration loop with confirmation pause, 3 SSE endpoints; verified end to end over HTTP (origin allowlist, streaming, confirm round trip, persistence); tool-plan + confirmation evals green |
| 7 | Knowledge and Retrieval (RAG) | done | embedder (stub + openai), chunker, file/url extraction, inline ingestion, pgvector retriever wired into runtime, Knowledge tab; verified ingest to grounded retrieval on live pgvector; rag-grounding evals green |
| 8 | Tools: OpenAPI Import and the Gateway | done | openapi parser, the Beckon Gateway (validate, rate limit, shared secret signing, encrypted host auth, secret redacted logs), Tools tab, runtime routes server tools through the gateway; openapi-mapping + gateway-guard evals green (incl. secret redaction) |
| 9 | SDK and Embeddable Widget | done | @beckon/client (session, SSE, action executor, confirm flow), @beckon/react (provider, widget, copilot, command surface, isolated styles), embed.js (Shadow DOM, 264kb); client-actions evals green |
| 10 | Playground and Install | done | in console playground (real widget via operator session), install page with embed token reveal once, React + script tag snippets, origin allowlist editor. Note: serving embed.js from the app is wired in Section 16 |
| 11 | Flows and Guardrails | done | flow engine (trigger detection + tool narrowing + step guidance) wired into runtime, flow builder UI, guardrails panel (block tools + confirm on write); flow-adherence + guardrails evals green. Enforcement in runtime and gateway |
| 12 | Observability and Analytics | done | conversation list + transcript replay (messages, tool calls, actions, confirmations), analytics summary (top intents, tool success rates) with minimal monochrome charts; logging pipeline persists every turn with secrets redacted |
| 13 | Demo Sandbox App | not started | |
| 14 | Evals and Quality Gate | not started | |
| 15 | Hardening | not started | |
| 16 | Deployment and Self Hosting | not started | |
| 17 | Activation Checklist | waits on human | the only stop point |

## Section 1 checklist

- [x] Contract lock: full Drizzle schema in `packages/db`, mirrored types and Zod in `packages/shared`
- [x] Repo and tooling: pnpm workspace, Turborepo, tsconfig base, Biome, gitignore, editorconfig, MIT license
- [x] Infrastructure: docker-compose (Postgres+pgvector, Redis, MinIO), .env.example
- [x] Database: Drizzle schema for every table, migrations, typed client, seed scaffold
- [x] Shared and evals: Zod schemas for tools, actions, chat events; Vitest eval runner; pnpm eval
- [x] Done when: pnpm install, typecheck, lint, test, eval all green; migrate + seed verified on live pgvector; README explains setup
