# Decisions

Engineering decisions made while building Beckon that are not spelled out in the
context document or the implementation guide. Newest at the top. Each entry: what was
decided, and why.

## 2026-06-15

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
