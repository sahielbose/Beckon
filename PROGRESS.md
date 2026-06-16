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
| 13 | Demo Sandbox App | done | CRM (clients, deals, tasks, P&L) with in memory store, its API + OpenAPI spec, embedded Beckon widget with client actions + onIdentify, data-beckon selectors, setup script + happy path readme |
| 14 | Evals and Quality Gate | done | 27 golden cases across all 9 categories incl. injection defense (retrieved content, impersonation, tool results all treated as data); CI gate definition at docs/ci-workflow.yml (copy to .github/workflows to activate, see D-021), verified locally |
| 15 | Hardening | done | strict response headers, gateway retries idempotent reads (never writes), SECURITY.md; injection defense, secret redaction, origin allowlist, encryption, reduced motion, and focus already built in. CSP guidance documented |
| 16 | Deployment and Self Hosting | done | serve embed.js from the console, Dockerfile (standalone) + full compose profile with migrate, Vercel + Docker guide (DEPLOY.md), docs pages (install/sdk/openapi/gateway/security), README architecture note |
| 17 | Activation Checklist | waits on human | the only stop point, reached |

## Section 1 checklist

- [x] Contract lock: full Drizzle schema in `packages/db`, mirrored types and Zod in `packages/shared`
- [x] Repo and tooling: pnpm workspace, Turborepo, tsconfig base, Biome, gitignore, editorconfig, MIT license
- [x] Infrastructure: docker-compose (Postgres+pgvector, Redis, MinIO), .env.example
- [x] Database: Drizzle schema for every table, migrations, typed client, seed scaffold
- [x] Shared and evals: Zod schemas for tools, actions, chat events; Vitest eval runner; pnpm eval
- [x] Done when: pnpm install, typecheck, lint, test, eval all green; migrate + seed verified on live pgvector; README explains setup

## Interface and gaps upgrade (2026-06-16)

A targeted pass on top of the finished product. No rebuild.

- **A. Interface upgrade (done).** One shared motion language across the product.
  Design system: textures (bg-grid, bg-spotlight), shimmer skeletons, tactile press,
  animated focus, sliding tab indicator, hover-lift cards, Stagger and Spinner.
  Marketing: scroll-aware nav, textured hero, quiet first-view reveals, hover states.
  Console: refined sidebar with active indicator, mobile drawer, loading skeletons,
  polished lists and tables. Live hero: a looping command surface that types, streams,
  confirms, and adds an Acme row to a mini CRM panel, with a static reduced-motion state.
  Palette unchanged, reduced motion respected, no layout shift.
- **B. Durable knowledge ingestion (done).** S3 compatible storage client; uploads are
  persisted and re-index needs no re-upload. BullMQ queue + worker driven by REDIS_URL,
  with an inline fallback when there is no Redis. Verified end to end on live MinIO + Redis.
- **C. Production confirmation registry (done).** Redis backed (BLPOP/RPUSH) when
  REDIS_URL is set, in memory otherwise. Confirm before write unchanged.
- **D. Email, password reset, team invites (done).** Resend mailer that logs offline
  and sends with a key. Password reset request and reset pages. Team invites by email
  with an accept flow. All degrade quietly with no key.
- **E. CI.** Workflow file ready; activation depends on a token with workflow scope.
- **F. Activation (stop point).** AUTH_SECRET and BECKON_ENCRYPTION_KEY generated into a
  local .env (not committed). Waiting on real model, embedding, and email keys.
