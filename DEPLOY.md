# Deploying Beckon

Two paths: a hosted deploy on Vercel, or a full self host with Docker Compose. The
console and the runtime are one Next.js app; the embed bundle is served from the same
origin at `/embed.js`.

## Self host with Docker Compose

This runs the app, Postgres with pgvector, Redis, and MinIO together.

```bash
# Build and start everything (the "app" profile adds the app and migrations).
AUTH_SECRET=$(openssl rand -base64 32) docker compose --profile app up --build
```

What happens:

1. Postgres, Redis, and MinIO start, and the uploads bucket is created.
2. The `migrate` service applies the database schema, then exits.
3. The `app` service starts the console at http://localhost:3000.

By default the app runs with `BECKON_STUB_LLM=true`, so it works offline. Set
`ANTHROPIC_API_KEY` (and optionally `OPENAI_API_KEY`) in the `app` service environment
to use real models. Set `BECKON_ENCRYPTION_KEY` before storing real host credentials.

For just the infrastructure during development, omit the profile:

```bash
pnpm infra:up      # Postgres, Redis, MinIO only
pnpm db:migrate
pnpm dev
```

## Hosted on Vercel

Point a Vercel project at this repository.

- Build command: `pnpm turbo run build --filter=@beckon/console...`
- Output directory: `apps/console/.next`
- Install command: `pnpm install`

The build filter includes the embed package, so `embed.js` is built and copied into
the console's public folder.

Set these environment variables in the project:

- `DATABASE_URL` (Postgres with the `vector` extension, for example Neon)
- `REDIS_URL` (optional, for background jobs)
- `AUTH_SECRET` (generate with `openssl rand -base64 32`)
- `AUTH_URL` and `NEXT_PUBLIC_APP_URL` (your deployed origin)
- `ANTHROPIC_API_KEY` and optionally `OPENAI_API_KEY`
- `EMBEDDING_PROVIDER` and `EMBEDDING_MODEL` (or leave on stub)
- `BECKON_ENCRYPTION_KEY` (32 byte base64) before storing host credentials
- S3 settings if you use a hosted bucket instead of MinIO

Run `pnpm db:migrate` against the production database once before the first deploy.

## Notes

- The Dockerfile builds the Next standalone output traced from the monorepo root. It
  is provided as a starting point; tune resources for your host.
- The in memory pending registry and rate limiter are correct for a single instance.
  For multiple instances, back them with Redis (see DECISIONS D-017).
