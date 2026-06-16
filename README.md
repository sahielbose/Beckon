# Beckon

Open source, embeddable AI copilot layer for web apps. Drop in a widget and your
users do things by chat: call your APIs, run client side functions, and navigate
your UI, instead of clicking through menus. Wire tools by importing an OpenAPI spec
or registering client functions. A secure gateway validates, rate limits, and logs
every call. A console manages agents, knowledge, tools, flows, guardrails, and
analytics.

The trust layer is the product. The gateway, the guardrails, the eval suite, and
prompt injection defense are built fully, not faked for a demo. Anything that sends,
posts, files, charges, or changes settings is gated behind an explicit confirm step.

MIT licensed. Self hostable with Docker Compose, or deploy the console to Vercel.

## Status

Early build, following `docs/BECKON-IMPLEMENTATION-GUIDE.md` section by section. See
`PROGRESS.md` for what is done and `DECISIONS.md` for engineering choices.

## What is in here

```
apps/console/      Next.js: marketing site, operator console, management API, runtime
apps/demo/         sample CRM and project app with Beckon embedded (the proof)
packages/shared/   Zod schemas, types, the tool and action protocol
packages/db/       Drizzle schema, migrations, typed client, seed
packages/agent-core/ the runtime: orchestration, tools, RAG, flows, guardrails
packages/gateway/  validating, rate limiting, secret redacting proxy to host backends
packages/client/   @beckon/client browser core: session, SSE, registries, executor
packages/react/    @beckon/react: BeckonProvider, BeckonWidget, BeckonCopilot
packages/embed/    builds embed.js (script tag, Shadow DOM)
packages/ui/       design system: tokens, primitives, motion, brand
evals/             golden cases and the runner (pnpm eval)
```

## Quick start (local)

Requirements: Node 20+, pnpm 10+, Docker.

```bash
pnpm install
cp .env.example .env          # fill in keys when you have them; stub mode works offline
pnpm infra:up                 # Postgres with pgvector, Redis, MinIO
pnpm db:migrate               # apply the schema
pnpm db:seed                  # create a demo workspace and agent
pnpm dev                      # console and demo dev servers
```

If port 5432 is already in use on your machine, point `DATABASE_URL` at a free port.

## Try the demo

`apps/demo` is a small CRM with Beckon embedded. Run it, wire an agent, and drive it
by chat. See `apps/demo/README.md`.

## Deploy

Self host with Docker Compose, or deploy the console to Vercel. The embed bundle is
served from the same origin at `/embed.js`.

```bash
# Full self host: app, Postgres with pgvector, Redis, and MinIO.
AUTH_SECRET=$(openssl rand -base64 32) docker compose --profile app up --build
```

See `DEPLOY.md` for both paths and the environment variables. Security posture is in
`SECURITY.md`.

## Architecture

The console (Next.js) renders the marketing site, the operator dashboard, and the
runtime API. Real logic lives in `packages/agent-core` (retrieve, plan, call tool, run
flow, guardrail check); route handlers and the SDK are thin adapters over it. Server
tool calls go through `packages/gateway`, the trust layer that validates, rate limits,
signs, and logs every call. Retrieval uses Postgres with pgvector. The SDK
(`@beckon/client`, `@beckon/react`, `embed.js`) drops the widget into any web app, and
every side effect is gated behind a confirm step.

## Commands

```bash
pnpm dev          # run app dev servers
pnpm build        # build everything
pnpm typecheck    # tsc across the workspace
pnpm lint         # biome check
pnpm test         # vitest
pnpm eval         # run the golden case suite (a failing case fails the build)
pnpm db:migrate   # apply database migrations
pnpm db:seed      # seed local data
pnpm infra:up     # start Postgres, Redis, MinIO
pnpm infra:down   # stop them
```

## Environment

See `.env.example` for the full list. Model and embedding keys are optional during
the build: when absent, the providers run in a clearly marked stub mode so the app
and the evals run fully offline. Real keys are wired during activation (Section 17 of
the guide). Never commit a real `.env`.

## Embedding (preview of the install)

React:

```tsx
<BeckonProvider agentId="agt_123" apiUrl="https://app.yourdomain.dev">
  <App />
  <BeckonCopilot position="right" width={400} />
</BeckonProvider>
```

Script tag:

```html
<script src="https://app.yourdomain.dev/embed.js" data-agent-id="agt_123"></script>
```

## License

MIT. See `LICENSE`.
