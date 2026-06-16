# Decisions

Engineering decisions made while building Beckon that are not spelled out in the
context document or the implementation guide. Newest at the top. Each entry: what was
decided, and why.

## 2026-06-15 (Section 14)

- **D-021 CI workflow shipped at `docs/ci-workflow.yml`.** The build token has
  `repo` scope but not GitHub `workflow` scope, so it cannot push files under
  `.github/workflows`. The complete CI definition (typecheck, lint, test, eval,
  build) is committed at `docs/ci-workflow.yml`. To activate, copy it to
  `.github/workflows/ci.yml` from a session with `workflow` scope or via the GitHub
  UI. The gate itself is real and verified to pass locally.

## 2026-06-15 (Section 9)

- **D-019 Install snippet carries the public embed token.** The widget authenticates
  with the scoped public embed token (bpk_), which is safe to expose in client side
  code because it is public, scoped to one agent, and validated against the agent's
  origin allowlist. The provider takes agentId, token, and apiUrl. This is the secure
  model from Section 3. The session endpoint also supports an agentId only flow
  (validated by origin alone) for the simplest setups.

- **D-020 The embed mounts the React widget into a Shadow DOM.** embed.js renders the
  same React widget into a shadow root and injects the compiled CSS there, so the host
  page's styles cannot leak in and the widget's styles cannot leak out. Built with
  tsup. This reuses one widget implementation rather than maintaining a separate
  vanilla build.

## 2026-06-15 (Section 6)

- **D-016 Provider abstraction with a stub default.** `agent-core` defines a
  `ChatProvider` interface. The StubProvider runs offline with deterministic,
  rule based tool planning so the loop, the confirmation gating, and the evals all
  run with no API keys. Real Anthropic and OpenAI providers are implemented with the
  official SDKs and selected only when a key is present (or forced off by
  BECKON_STUB_LLM). The real providers are unverified until keys arrive in Section 17;
  they are clearly the non default path.

- **D-017 Confirmation pause via a pending registry.** A side effecting tool or
  action emits a confirmation_request and the loop awaits a deferred keyed by the
  event id. The widget reports the decision (and later the client action result) to
  POST /api/action-result, which settles the deferred and the loop continues on the
  same SSE stream. The default registry is in memory, which is correct for a single
  node process (self host) and Next dev. Multi instance hosting needs a Redis backed
  registry; the interface allows swapping it in Section 15. This is documented, not
  hidden.

- **D-018 Conversation backed sessions.** A session is a conversation row. Message
  history is persisted in the messages table and reloaded each turn, so multi turn
  chat survives across requests without server memory.

## 2026-06-15 (Section 3)

- **D-013 Auth.js v5 with JWT session strategy.** The email and password path uses
  the Credentials provider, which Auth.js only supports with the JWT session
  strategy (database sessions are incompatible with Credentials). Users, accounts,
  organizations, and memberships are persisted in Postgres via the Drizzle adapter,
  so identity is database backed even though the session token itself is a signed
  JWT cookie. OAuth providers use the same flow. The `sessions` table is kept for
  adapter compatibility.

- **D-014 Password hashing with node:crypto scrypt; key hashing with SHA-256.**
  Passwords use scrypt (built into node, no dependency, salted, slow by design).
  API keys and embed tokens are high entropy random strings, so a fast SHA-256 hash
  is sufficient and is the same algorithm used by the runtime to look a token up.
  Only a short plaintext prefix plus the hash are stored. The full token is shown
  once at creation.

- **D-015 Org bootstrap on first sign in.** A user's first organization and owner
  membership are created lazily the first time they reach the app, in one helper
  used by both the credentials sign up and OAuth sign in paths.

## 2026-06-15 (Section 2)

- **D-009 Console app scaffolded in Section 2.** Section 2's done criterion is a
  component preview route, which needs a Next app to render. We scaffold
  `apps/console` (Next.js 15, App Router, React 19) now and build out its marketing
  and dashboard surfaces in Sections 4 and 5.

- **D-010 Tailwind v3, not v4.** Tailwind v3.4 with PostCSS is the well trodden path
  for shadcn primitives and a shared monorepo preset. We map the design tokens to
  Tailwind via CSS variables so theming stays in one place.

- **D-011 Fonts self hosted via next/font and the `geist` package.** Geist Sans for
  display, Inter for body, Geist Mono for the monospace command surface. next/font
  and the `geist` package self host the files at build time, satisfying the no
  hotlink rule.

- **D-012 Toasts via `sonner`, primitives via Radix.** shadcn style primitives are
  built on Radix UI (MIT) and themed to our tokens. Toasts use `sonner` (MIT).

## 2026-06-15 (Section 1)

- **D-001 Existing README replaced.** The repo shipped with a README describing a
  "personal command bar" (the consumer reframe). Per BECKON-CONTEXT.md Section 0 we
  build the B2B embeddable copilot clone, not the consumer command bar. The README is
  rewritten to match the product we are building.

- **D-002 Source documents committed under `docs/`.** `BECKON-CONTEXT.md` and
  `BECKON-IMPLEMENTATION-GUIDE.md` are copied into `docs/` so the repo is self
  contained and subagents in future sessions can read the source of truth.

- **D-003 Lint and format with Biome.** The guide allows "Biome or ESLint plus
  Prettier." Biome is one fast tool, one config, fewer dependencies, and is MIT. We
  use Biome for lint and format across the workspace.

- **D-004 Package consumption via TypeScript source, not prebuilt dist.** Workspace
  packages export their `src` entry directly and consumers resolve them through
  `tsconfig` path aliases (and `transpilePackages` in Next, `vite-tsconfig-paths` in
  Vitest). This keeps the monorepo runnable without a per package build step during
  development, which keeps `pnpm typecheck` and `pnpm eval` fast and simple. Publish
  time builds (tsup) are added for the SDK packages in Section 9 where a real npm
  artifact matters.

- **D-005 Postgres driver is `postgres` (postgres.js).** Pairs cleanly with Drizzle,
  is MIT, and supports the `pgvector` extension via Drizzle's `vector` column type.

- **D-006 `pnpm dev` split from infrastructure.** The guide says `pnpm dev` brings up
  the stack. We split this into `pnpm infra:up` (docker compose: Postgres, Redis,
  MinIO) and `pnpm dev` (Turborepo app dev servers), because the infra is long lived
  and the app servers restart often. The documented local flow is
  `pnpm infra:up && pnpm dev`. Recorded so the split is intentional, not an omission.

- **D-007 Node engine pinned to >=20.** Next.js 15 and the toolchain require Node
  18.18+. We require Node 20+ for stable fetch, test runner, and crypto. The dev
  machine runs Node 25, which is compatible.

- **D-008 Default models.** Claude (Anthropic) is the default chat model behind a
  provider interface, OpenAI is optional. Embeddings default to OpenAI
  `text-embedding-3-small` behind the same interface, with the provider swappable.
  No keys are wired until Section 17. Until then the providers run in a clearly
  marked stub mode (deterministic mock responses) so the app and evals run offline.

## 2026-06-16 (interface and gaps upgrade)

- **D-022 Durable ingestion with graceful fallbacks.** Uploaded files are stored in
  S3 compatible storage and ingestion reads from there, so re-index needs no
  re-upload. Ingestion is enqueued to BullMQ when REDIS_URL is set, otherwise it runs
  inline; when storage is not configured the file is ingested once from the buffer in
  hand. This keeps local and offline runs working with no Redis and no S3, matching the
  stub ethos, while production gets the durable, async path.

- **D-023 Redis backed confirmation registry.** The pause for confirm registry uses
  Redis (BLPOP/RPUSH) when REDIS_URL is set so the chat stream and the action result
  callback work across instances and serverless, and falls back to the in memory
  registry otherwise. The PendingRegistry.settle signature was widened to allow an
  async implementation. Confirm before write behavior is unchanged.

- **D-024 Email, reset, invites.** Resend mailer logs and no ops without a key, sends
  with one. Password reset reuses verification_tokens with a namespaced identifier
  (pwreset:email) and a hashed token. Team invites use a new invitations table with a
  hashed single use token and an explicit accept step (consistent with the confirm
  before change rule).

- **D-025 Local activation secrets generated.** AUTH_SECRET and BECKON_ENCRYPTION_KEY
  were generated with openssl into a local .env that is gitignored and never committed.
  Real model, embedding, and email keys are still required to leave stub mode.

- **D-021 (still open) CI workflow scope.** The CI workflow lives at
  docs/ci-workflow.yml and a copy at .github/workflows/ci.yml. Pushing the workflow
  file is rejected unless the git token has the GitHub workflow scope, so it must be
  added through the GitHub UI (or pushed from a session whose token has that scope).
