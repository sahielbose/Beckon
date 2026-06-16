# Beckon demo app

A small sample CRM (clients, deals, tasks, and a profit and loss view) with Beckon
embedded. It proves the product works end to end: you drive a real app by chat.

The CRM data lives in memory and resets on restart, which is fine for a sandbox.
The app's own API is described by an OpenAPI spec at `/api/openapi.json`. That spec
is imported into a Beckon agent, so the agent's tools call this app through the
gateway.

## Run it

```bash
pnpm --filter @beckon/demo dev      # http://localhost:3100
```

The copilot stays hidden until you wire an agent (below).

## Wire the copilot

With the console and the demo both running, and `DATABASE_URL` set:

```bash
pnpm --filter @beckon/console exec tsx scripts/setup-demo.ts
```

That creates a "CRM copilot" agent, imports this app's OpenAPI as tools, points the
gateway at the demo, allows the demo origin, and mints an embed token. Copy the
printed values into `apps/demo/.env.local`:

```
NEXT_PUBLIC_BECKON_AGENT_ID=agt_...
NEXT_PUBLIC_BECKON_TOKEN=bpk_...
NEXT_PUBLIC_BECKON_API_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_URL=http://localhost:3100
```

Restart the demo. The copilot bubble appears in the corner.

You can also wire it by hand in the console: create an agent, on Tools paste
`http://localhost:3100/api/openapi.json`, on Install create an embed token and add
`http://localhost:3100` as an allowed origin.

## The happy path

Open the copilot and try, in order:

1. `Create a client named Acme` (a write, so it shows a confirm card first)
2. `Open the profit and loss` (a client side UI action that scrolls the page)
3. `Add a follow up task to call Acme next week` (another write, confirmed first)

Every action that writes waits for you to confirm before it runs.
