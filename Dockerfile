# syntax=docker/dockerfile:1
# Self host image for the Beckon console (and runtime). Build from the repo root:
#   docker build -t beckon-console .

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
# Build the embed bundle, then the console (which copies embed.js into public).
RUN pnpm --filter @beckon/embed build
RUN pnpm --filter @beckon/console... build

FROM base AS runner
ENV NODE_ENV=production
# Next standalone output preserves the monorepo layout under apps/console.
COPY --from=build /app/apps/console/.next/standalone ./
COPY --from=build /app/apps/console/.next/static ./apps/console/.next/static
COPY --from=build /app/apps/console/public ./apps/console/public
EXPOSE 3000
CMD ["node", "apps/console/server.js"]
