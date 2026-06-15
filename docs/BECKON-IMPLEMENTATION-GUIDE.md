# Beckon: Full Implementation Guide

End to end build instructions for Beckon, an open source, embeddable AI copilot layer for web apps. Read this alongside `BECKON-CONTEXT.md`, which holds the product research, architecture, and stack rationale. This file is the build plan: it covers the marketing site, the app, the backend, the SDK, the widget, the demo, evals, hardening, and deployment, in the order they should be built.

The goal is that Claude Code can execute this almost entirely on its own. The only place you are asked for input is the final section.

---

## 0. Operating protocol (read before building)

### Autonomy
Build everything in this guide without stopping to ask for confirmation, except for the items collected in Section 17. Make sensible engineering choices and write them down in the README or a `DECISIONS.md` as you go. If a genuine blocker appears that is not covered here and not in Section 17, pick the most reasonable option, note it, and keep moving.

### Parallel agents per section
Each section below lists a set of agents meant to run at the same time. Within a section the work is parallel; across sections the work is sequential, because later sections depend on earlier ones.

Run each section like this:
1. **Contract lock (do this first, single commit).** Before fanning out, define the shared things the parallel agents will depend on: database fields, TypeScript types, Zod schemas, API route signatures, and component prop interfaces. Put shared contracts in `packages/shared` and `packages/db`. Commit them. This is what keeps parallel agents from colliding.
2. **Fan out.** Dispatch the listed agents concurrently. Each agent works only inside the file paths assigned to it. No two agents in the same section write the same file.
3. **Each agent self-checks before committing.** Typecheck, lint, and run its own unit tests and eval cases. Commit in small units (see Commits below).
4. **Integrate (single commit).** After the section's agents finish, run the full workspace build, typecheck, lint, and the eval suite. Fix any seams between agents. Make one integration commit that closes the section.

### Commit discipline
Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `style:`). Commit after every meaningfully complete unit of work, not once per section. A single file or a single component or a single endpoint is a commit. Each section should produce many commits across its agents plus one integration commit. Never bundle a whole section into one commit. Write clear messages that name the thing, for example `feat(console): add agent settings form` or `test(rag): add citation grounding golden cases`.

### Design rules (apply to everything the end user sees)
- Background is white or near white. Text and primary controls are near black. The accent is black. Color is used sparingly and only for state (error, success), never for decoration.
- Layout is calm and spacious. Lots of whitespace. Hairline borders. Small, consistent radii. Soft, barely there shadows.
- Animations are smooth and quiet: short durations, gentle easing, small movements. No bounce, no spring overshoot, no attention grabbing motion. Respect `prefers-reduced-motion`.
- Everything is intuitive. A first time user should understand each screen without a manual.
- No em dashes anywhere in the UI or in this build's copy. Use commas, colons, periods, or parentheses.
- No emojis anywhere in the product.
- No jargon in the UI. Name things by what the user controls, not by how the system is built. The detailed type, color, motion, and copy specs are in Section 2.

(These constraints govern the product. This guide itself uses precise technical language for the build agents.)

### Side effect rule
Anything that sends, posts, files, charges, changes settings, or otherwise writes must be gated behind an explicit confirm step in the widget. Nothing with a side effect executes until the user confirms. This is enforced in the runtime, in the gateway, and in the widget. Never auto submit a form or move money.

### Open source rule
MIT licensed. Permissive dependencies only. No hardcoded secrets. Ship a `.env.example`. Keep the repo modular and self hostable. Provide both a hosted path (Vercel) and a self host path (Docker Compose).

### Evals as you go
The eval harness is set up in Section 1 and consolidated in Section 14, but every feature section adds its own golden cases as part of its definition of done. A failing eval is a failing build.

---

## 1. Foundation and Infrastructure

**Goal.** A running monorepo with the database, queues, storage, shared types, the full data model, tooling, and an empty eval harness. Everything else builds on this.

**Stack.** TypeScript, Next.js (App Router), pnpm workspaces, Turborepo, Postgres with pgvector, Drizzle ORM, Redis with BullMQ, S3 compatible storage (MinIO for local), Zod, Vitest, Tailwind, Biome or ESLint plus Prettier for lint and format.

**Contract lock (first commit).** The full database schema and shared types. Define these tables in `packages/db` and mirror the types in `packages/shared`:

- `users`, `accounts`, `sessions`, `verification_tokens` (Auth.js).
- `organizations` (id, name, owner_id, created_at).
- `memberships` (user_id, org_id, role: owner or admin or member).
- `agents` (id, org_id, name, slug, model, system_prompt, persona, status: draft or live, created_at).
- `api_keys` (id, org_id, agent_id nullable, type: secret or embed_public, key_hash, key_prefix, last_used_at, revoked_at, created_at).
- `allowed_origins` (id, agent_id, origin).
- `knowledge_sources` (id, agent_id, type: file or url, name, source_uri, status: pending or processing or ready or error, size_bytes, error, created_at).
- `chunks` (id, source_id, agent_id, content, embedding vector, metadata jsonb, token_count).
- `tool_specs` (id, agent_id, type: openapi or mcp or client, name, raw_spec jsonb, server_url, created_at).
- `tools` (id, agent_id, tool_spec_id, name, description, parameters_schema jsonb, http_method, path_template, side_effect bool, requires_confirmation bool, enabled bool).
- `client_actions` (id, agent_id, name, description, action_type: navigate or click or fill or custom, target, params_schema jsonb, side_effect bool, requires_confirmation bool, enabled bool).
- `gateway_configs` (id, agent_id, base_url, auth_type: header or bearer or none, shared_secret_hash, rate_limit_per_min, allowed_operations jsonb).
- `flows` (id, agent_id, name, trigger jsonb, steps jsonb, enabled bool).
- `guardrails` (id, agent_id, allowed_tools jsonb, blocked_tools jsonb, confirm_on_write bool default true, scopes jsonb).
- `conversations` (id, agent_id, external_user_id, origin, status, started_at).
- `messages` (id, conversation_id, role, content, created_at).
- `tool_calls` (id, conversation_id, message_id, tool_id, args jsonb, result jsonb, status, latency_ms, error, requires_confirmation bool, confirmed_at).
- `action_events` (id, conversation_id, action_type, payload jsonb, confirmed_at, result jsonb).

**Parallel agents.**
- **Agent A, repo and tooling.** Owns root config: `pnpm-workspace.yaml`, `turbo.json`, root `package.json`, `tsconfig.base.json`, lint and format config, `.gitignore`, `.editorconfig`, commit hooks. Sets up the workspace layout from `BECKON-CONTEXT.md` Section 15.
- **Agent B, infrastructure.** Owns `docker-compose.yml` (Postgres with pgvector, Redis, MinIO), `.env.example`, local bootstrap script, and a `make dev` or `pnpm dev` flow that brings the stack up.
- **Agent C, database.** Owns `packages/db`: Drizzle schema for every table above, migrations, a typed client, and seed scaffolding.
- **Agent D, shared and evals.** Owns `packages/shared` (Zod schemas and types for tools, actions, chat events, the action protocol) and `evals/` (a Vitest based runner, a `cases/` folder structure, a `pnpm eval` script that reports pass and fail per case). No cases yet, just the harness.

**Done when.** `pnpm install` then `pnpm dev` brings up the database, queue, and storage. Migrations apply cleanly. `pnpm typecheck`, `pnpm lint`, and `pnpm eval` all run with zero errors. README explains setup and env vars.

**Commits (examples).** `chore: init pnpm turborepo workspace`, `chore(infra): add docker compose for postgres redis minio`, `feat(db): add core schema and migrations`, `feat(shared): add tool and action protocol schemas`, `test: scaffold eval harness and runner`, `docs: write setup and env section`, then the integration commit `chore: wire foundation and verify dev stack`.

---

## 2. Design System and Shared UI

**Goal.** One design system used by both the marketing site and the app. Precise, minimal, distinctive within the white and black brief. Built once, imported everywhere.

**Token system.**

Color (named hex):
- `--bg` pure white `#FFFFFF`.
- `--bg-subtle` `#FAFAFA` for alternating sections and inset surfaces.
- `--ink` near black `#0A0A0A` for primary text and the primary button fill.
- `--ink-muted` `#5C5C5C` for secondary text.
- `--ink-faint` `#8A8A8A` for captions and placeholders.
- `--line` hairline border `#E6E6E6`.
- `--line-strong` `#D4D4D4` for focused or active borders.
- State only, used sparingly: `--danger` `#C0362C`, `--success` `#1E7A46`. No other color.

Type roles. Use deliberate faces, not a single neutral default:
- Display and headings: a precise modern grotesk. Use **General Sans** or **Geist Sans** at semibold with tight tracking. Big size jumps, confident scale.
- Body: **Inter** at regular and medium, generous line height (1.6 for prose).
- Utility and labels: a monospace, **JetBrains Mono** or **Geist Mono**, used uppercase with wide letter spacing for eyebrows, section markers, metadata, and inside the widget.

All faces are free and openly licensed. Self host the font files, do not hotlink.

Layout. Max content width around 1120px with generous gutters. An 8 point spacing scale. A simple 12 column grid for the marketing site, a sidebar plus content frame for the app.

Radii and shadow. Radius scale 6, 8, 12. Shadows are minimal: rest `0 1px 2px rgba(0,0,0,0.04)`, hover `0 2px 8px rgba(0,0,0,0.06)`. Nothing heavier.

Motion spec.
- Durations: 120ms for micro interactions, 200ms standard, 280ms for larger entrances.
- Easing: `cubic-bezier(0.2, 0, 0, 1)`.
- Enter transitions: opacity from 0 to 1 with a 4 to 8px upward translate. No scale bounce.
- Hover: subtle background or border shift only.
- Always wrap in `prefers-reduced-motion` so motion can be fully disabled.
- Use Framer Motion (the `motion` package) plus Tailwind transitions. Keep it quiet. Over animation reads as machine generated, so less is more.

**The signature element.** A monospace command surface. The product is about controlling an app by typing, so the memorable element is a clean command and chat surface rendered in mono with a single blinking caret, on white, with black ink. It appears as the hero (a live, working instance driving the demo app), and the same surface is the widget. This is the one place boldness is spent. Everything around it stays disciplined and quiet.

**Component inventory.** Build these as restyled shadcn primitives in `packages/ui`, themed to the tokens above:
button (primary solid black, secondary white with border, ghost), input, textarea, select, checkbox, switch, label, card, badge, tabs, table, dropdown menu, dialog, sheet (for the sidebar copilot), tooltip, toast, skeleton loader, empty state, code block, copy to clipboard button, file dropzone, and a status pill (pending, processing, ready, error). Icons come from `lucide-react`, line style, never emoji.

**Copy rules for the whole product.**
- Write from the user's side of the screen. A person manages knowledge sources, not vector chunks.
- Buttons are active verbs and keep the same word through the flow. The button that says Publish produces a toast that says Published, not a button that says Submit.
- Sentence case for labels and buttons. Plain words. No filler. No exclamation pile ups.
- Errors explain what happened and how to fix it, in the product's voice, without apologizing or being vague.
- Empty screens invite an action, for example "Add your first knowledge source" with the button right there.
- No em dashes, no emojis, no jargon.

**Parallel agents.**
- **Agent A, tokens and theme.** Owns the Tailwind config, CSS variables, font setup, dark of nothing (the product is light only for v1), and global styles.
- **Agent B, primitives.** Owns `packages/ui` components listed above.
- **Agent C, motion.** Owns shared motion utilities and the entrance and hover patterns, plus the reduced motion wrapper.
- **Agent D, brand assets.** Owns the Beckon wordmark (text based, set in the display face), favicon, social card, and the command surface visual that is the signature.

**Done when.** A component preview route renders every primitive, all states are keyboard reachable with visible focus, motion respects reduced motion, and nothing uses color for decoration. The wordmark and command surface look clean and intentional.

**Commits (examples).** `feat(ui): add design tokens and tailwind theme`, `feat(ui): add button input and card primitives`, `feat(ui): add tabs table and dialog`, `feat(ui): add motion utilities with reduced motion`, `feat(brand): add wordmark favicon and command surface`, integration commit `chore(ui): assemble design system and preview route`.

---

## 3. Authentication, Organizations, and API Keys

**Goal.** Sign up and sign in, multi tenant data scoping, and the two kinds of keys the product needs.

**Contract lock.** Finalize the auth tables, the membership roles, and the key types and hashing scheme. Secret keys are shown once at creation, then only a prefix is stored in plain text and the rest is hashed. Public embed tokens are scoped to one agent and validated against that agent's allowed origins.

**Build.**
- Auth.js with email plus password and at least one OAuth provider, sessions in Postgres.
- On first sign up, create an organization and an owner membership automatically.
- Middleware that scopes every app query to the current org. A user cannot read another org's agents, keys, conversations, or anything else.
- Secret API key create, list, reveal once, and revoke. Public embed token create and revoke. Origin allowlist management per agent.
- Account and team settings pages: profile, members, roles, sign out.

**Parallel agents.**
- **Agent A, auth flows.** Sign up, sign in, sign out, password reset, OAuth, session handling.
- **Agent B, tenancy.** Org creation, memberships, the org scoping middleware, role checks.
- **Agent C, keys and tokens.** Key generation, hashing, reveal once UX, revoke, embed token issuance, origin allowlist.
- **Agent D, settings UI.** Account, team, and key management screens using the design system.

**Done when.** A new user can sign up, lands in their own org, can create and revoke keys, and cannot access another org's data. Cross tenant access attempts are blocked and tested.

**Commits (examples).** `feat(auth): add email and oauth sign in`, `feat(tenancy): auto create org on signup`, `feat(tenancy): add org scoping middleware`, `feat(keys): secret keys with hash and reveal once`, `feat(keys): embed tokens and origin allowlist`, `feat(settings): account and team pages`, integration commit `test(auth): verify tenant isolation`.

---

## 4. Marketing Site

**Goal.** A clean public site that explains Beckon and sends people into the app. This is the main site. The primary call to action everywhere is Open app or Sign up, never book a demo.

**Routes** (route group `(marketing)`):
- `/` home. Hero is the live command surface driving the demo app, the thesis that the widget acts rather than answers, a short how it works strip, and feature highlights.
- `/how-it-works` the real sequence: connect knowledge, wire tools, set guardrails, install, watch. Because this is a true ordered process, numbered markers are appropriate here.
- `/use-cases` concrete scenarios (in app navigation, taking actions, answering from your own docs).
- `/pricing` simple and honest. Self host is free, hosted tiers optional. Plain language.
- `/docs` the documentation shell and getting started, with the install snippet.
- Footer with links, GitHub, and legal stubs.

**Navigation handoff.** A sticky, minimal top nav with the wordmark on the left and a primary Open app button on the right. If the visitor is signed in, Open app routes to `/app`. If not, it routes to `/login` and returns to `/app` after sign in. This is the bridge from the main site to the app.

**Parallel agents.**
- **Agent A, home.** Hero with the live command surface, the how it works strip, and feature sections.
- **Agent B, how it works and use cases.** The ordered process page and the scenarios page.
- **Agent C, pricing, nav, footer.** Pricing tiers, the sticky nav with the Open app handoff, and the footer.
- **Agent D, docs shell.** The docs layout, sidebar, getting started, and the install snippet block.

**Done when.** Every page is responsive to mobile, motion is quiet and respects reduced motion, copy follows the rules in Section 2, and Open app correctly routes based on auth state. The hero genuinely demonstrates the product.

**Commits (examples).** `feat(site): home hero with live command surface`, `feat(site): how it works ordered process`, `feat(site): use cases page`, `feat(site): pricing nav and footer`, `feat(site): docs shell and getting started`, integration commit `chore(site): polish responsive and reduced motion`.

---

## 5. App Shell and Navigation

**Goal.** The frame that every app screen lives in, and the routing from the main site into a specific agent's workspace.

**Build.**
- Route group `(app)` mounted at `/app`. Optionally support an `app.` subdomain later, but route groups are fine for v1.
- A left sidebar with the agent switcher at the top, then the per agent navigation: Playground, Knowledge, Tools, Flows, Guardrails, Install, Conversations, Analytics. Settings sits at the bottom.
- A slim top bar with breadcrumbs and the user menu.
- The agents list and create agent flow at `/app`.
- Loading and empty states for every list, written as invitations to act.

**Parallel agents.**
- **Agent A, shell.** Sidebar, top bar, breadcrumbs, user menu, responsive collapse.
- **Agent B, agent switcher and routing.** The switcher, agent creation, and the per agent route structure.
- **Agent C, list and empty states.** The agents overview, skeletons, and empty states.

**Done when.** A signed in user lands on `/app`, can create an agent, and can navigate every tab of that agent. The shell is calm, quiet, and keyboard friendly.

**Commits (examples).** `feat(app): sidebar and top bar shell`, `feat(app): agent switcher and creation`, `feat(app): agents overview and empty states`, integration commit `chore(app): verify shell navigation`.

---

## 6. Agent Core (the runtime and verbs)

**Goal.** The orchestration engine, kept as a framework agnostic package so a thin transport can call it. This is the heart. All real logic lives here, not in route handlers or components.

**Package.** `packages/agent-core`.

**Build.**
- A provider abstraction with Claude as the default and OpenAI optional, exposing a single chat with tools and streaming interface.
- A tool registry that holds server tools (from OpenAPI and later MCP), client tools, and client actions, each with a Zod parameter schema and a side effect flag.
- The orchestration loop: take messages, retrieve knowledge context, build the prompt with available tools and any active flow, call the model, handle tool calls, and loop until a final answer.
- Server tool calls route through the gateway (Section 8). Client tools and actions are streamed to the widget as events. Any side effect tool or action is marked requires confirmation, and the loop pauses for the widget to report a confirmed result before continuing.
- The action protocol: a typed event stream over SSE. Event types include `token`, `tool_call`, `tool_result`, `action_request`, `action_result`, `confirmation_request`, and `done`. Define these in `packages/shared`.
- Full per turn logging hooks so Section 12 can record everything.

**Endpoints (thin adapters in the console app).**
- `POST /api/session` validates the embed token and origin, returns a session id.
- `POST /api/chat` streams the loop over SSE.
- `POST /api/action-result` receives the outcome of a client action or a confirmation from the widget.

**Parallel agents.**
- **Agent A, providers.** The provider interface and the Claude and OpenAI implementations.
- **Agent B, orchestration loop.** The core loop, context assembly, and the pause for confirmation logic.
- **Agent C, tool registry and action protocol.** The registry, the typed event schema, and the side effect and confirmation flags.
- **Agent D, streaming transport.** The SSE adapters and the three endpoints, plus a tiny test client.

**Done when.** The Playground (built next in Section 10, but stub a minimal test page here) can chat with the agent, the model can call a mock tool, results stream token by token, and a mock side effect tool pauses for confirmation and only proceeds after a confirmed result. First eval cases pass.

**Evals to add.** `tool-plan`: given a message, the agent selects the expected tool and constructs the expected argument shape. `confirmation`: a side effect tool never executes before a confirmed result arrives.

**Commits (examples).** `feat(core): provider abstraction with claude default`, `feat(core): orchestration loop with tool calling`, `feat(core): tool registry and typed action protocol`, `feat(core): sse chat session and action result endpoints`, `test(core): tool plan and confirmation golden cases`, integration commit `chore(core): verify end to end loop with mock tools`.

---

## 7. Knowledge and Retrieval (RAG)

**Goal.** Let an operator add files and URLs that the agent can answer from, with correct citations and no invented sources.

**Build.**
- Ingestion for uploaded files (PDF, text, markdown, docx) and URLs (fetch and extract main content).
- Chunking with overlap, embedding through the provider abstraction, storage in `chunks` with pgvector.
- Ingestion runs as BullMQ jobs so the UI stays responsive. Sources show pending, processing, ready, or error with a clear message on failure.
- Retrieval: top k by vector similarity, fed into the orchestration loop as context, with citation metadata so answers can point to the exact source.
- The Knowledge tab: add by upload or URL, a sources list with status pills, remove a source, and a re index action.

**Parallel agents.**
- **Agent A, ingestion pipeline.** File and URL intake, extraction, chunking, and the BullMQ jobs.
- **Agent B, embeddings and vector store.** Embedding calls, pgvector writes, and similarity queries.
- **Agent C, retrieval and citations.** Top k retrieval, context formatting, and citation grounding in the loop.
- **Agent D, knowledge UI.** The Knowledge tab, dropzone, URL input, status pills, and empty state.

**Done when.** A user uploads a document, sees it reach ready, asks a question in the Playground, and gets an answer grounded in that document with a correct citation. Retrieval failures and empty knowledge are handled gracefully.

**Evals to add.** `rag-grounding`: answers cite the correct chunk and never cite a source that does not support the claim.

**Commits (examples).** `feat(rag): file and url ingestion jobs`, `feat(rag): chunking and pgvector embeddings`, `feat(rag): top k retrieval with citations`, `feat(rag): knowledge tab and status pills`, `test(rag): citation grounding golden cases`, integration commit `chore(rag): verify ingestion to grounded answer`.

---

## 8. Tools: OpenAPI Import and the Beckon Gateway

**Goal.** Turn an operator's API into callable tools, and put a secure gateway in front of every call. This gateway is the trust layer that makes the product real, so it is built now, not deferred.

**Build.**
- OpenAPI import: paste or upload a spec, parse each operation into a tool with a name, description, parameter schema, method, and path template. Detect writes (POST, PUT, PATCH, DELETE) and default those to side effect true and requires confirmation true.
- The Beckon Gateway in `packages/gateway`: every server tool call passes through it. It validates the request against the operation schema, attaches the operator configured auth, enforces a per minute rate limit, restricts to allowed operations, logs the request and response with secrets redacted, and rejects malformed or disallowed calls.
- Operator configured host auth: a header key or bearer token stored encrypted, plus a shared secret so the host can verify calls came from Beckon.
- The Tools tab: import a spec, see the generated tools, toggle each on or off, edit descriptions, and flip the requires confirmation flag per tool.

**Parallel agents.**
- **Agent A, OpenAPI parser.** Spec parsing, tool generation, write detection, and schema extraction.
- **Agent B, gateway.** The validating, rate limiting, secret signing, redacting proxy and its call interface used by the runtime.
- **Agent C, secret handling.** Encryption at rest for host credentials, the shared secret scheme, and redaction in logs.
- **Agent D, tools UI.** Import flow, generated tools list, per tool toggles and confirmation flags.

**Done when.** A user imports a spec, the tools appear, the agent calls one through the gateway in the Playground, a write tool pauses for confirmation, and the gateway rejects a malformed call and rate limits a flood. No secret ever appears in a log.

**Evals to add.** `openapi-mapping`: spec produces the expected tools and the agent builds valid arguments. `gateway-guard`: writes require confirmation, disallowed operations are rejected.

**Commits (examples).** `feat(tools): openapi spec parser and tool generation`, `feat(gateway): validating rate limiting proxy`, `feat(gateway): encrypted host auth and shared secret`, `feat(gateway): redact secrets in request logs`, `feat(tools): tools tab with toggles and confirm flags`, `test(tools): openapi mapping and gateway guard cases`, integration commit `chore(tools): verify spec to guarded call`.

---

## 9. SDK and Embeddable Widget

**Goal.** The drop in pieces that put Beckon inside any web app: a React SDK and a script tag build, both using the command surface as the widget and both enforcing confirmation on writes.

**Packages.** `packages/client` (browser core), `packages/react` (`@beckon/react`), `packages/embed` (builds `embed.js`).

**Build.**
- `@beckon/client`: session start, the SSE chat connection, a client tool registry, a client action executor (navigate, click, fill, custom), the confirmation flow, and the report back to `/api/action-result`.
- `@beckon/react`: `<BeckonProvider agentId apiUrl>`, a floating `<BeckonWidget>`, and a sidebar `<BeckonCopilot position width>`. Props include `agentName`, `defaultOpen`, a `tools` map of host functions the agent can call, an `actions` map for client side UI actions, and an `onIdentify` hook that returns the current user.
- `embed.js`: a framework agnostic build that mounts the widget in a Shadow DOM for full style isolation, configured by data attributes on the script tag. Same confirmation behavior.
- The widget UI is the command surface from Section 2: mono input, streaming responses, tool and action status lines, and a clear confirm card for any write that shows exactly what will happen before it happens.

Example React usage to match:
```
<BeckonProvider agentId="agt_123" apiUrl="https://app.yourdomain.dev">
  <App />
  <BeckonCopilot position="right" width={400} />
</BeckonProvider>
```
Example script tag:
```
<script src="https://app.yourdomain.dev/embed.js" data-agent-id="agt_123"></script>
```

**Parallel agents.**
- **Agent A, client core.** Session, SSE, registries, and the report back.
- **Agent B, react components.** Provider, Widget, Copilot, and prop handling.
- **Agent C, embed build.** The Shadow DOM script tag bundle and data attribute config.
- **Agent D, action executor and confirm UI.** The navigate, click, fill executor and the confirmation card.

**Done when.** Both the React components and the script tag mount cleanly, do not leak styles into the host page, stream answers, run a client tool and a UI action, and show a confirm card before any write. The widget looks like the signature command surface.

**Evals to add.** `client-actions`: the widget produces valid action payloads and never runs an unconfirmed write.

**Commits (examples).** `feat(client): session sse and registries`, `feat(react): provider widget and copilot`, `feat(embed): shadow dom script tag build`, `feat(client): action executor and confirm card`, `test(client): client action safety cases`, integration commit `chore(sdk): verify react and script tag parity`.

---

## 10. Playground and Install

**Goal.** A place to test an agent before shipping, and a place to get the snippet and keys to ship it.

**Build.**
- Playground: a full version of the widget inside the console, wired to the current agent, showing the streamed turn including retrieved context, tool calls, actions, and confirmations, so the operator can see exactly what the agent does.
- Install: the React snippet and the script tag snippet with the agent id filled in, a copy button, the embed token, and the origin allowlist editor. Clear plain language on where to paste each piece.

**Parallel agents.**
- **Agent A, playground.** The in console widget and the turn inspector.
- **Agent B, install UI.** The snippets, copy buttons, and origin allowlist editor.
- **Agent C, snippet generator.** The logic that fills snippets with the right agent id and api url for the environment.

**Done when.** An operator can fully exercise an agent in the Playground and copy a working snippet that, when pasted into the demo app, brings the same agent to life.

**Commits (examples).** `feat(playground): in console widget and turn inspector`, `feat(install): snippets and copy buttons`, `feat(install): origin allowlist editor`, integration commit `chore(app): verify playground and install`.

---

## 11. Flows and Guardrails

**Goal.** Operator defined multi step workflows, and enforceable limits on what the agent may do.

**Build.**
- Flows: a model and a simple builder for ordered steps with a trigger (phrases or intent) and per step tool restrictions, for example a cancellation flow that offers a retention option first and only cancels if the user still wants out. The runtime detects a matching trigger and steers the agent through the steps, narrowing the tool set per step.
- Guardrails: allowed and blocked tool lists, a confirm on write switch that defaults on, and scopes. Enforced in both the runtime and the gateway. A blocked tool is never callable. A write without a confirmation never executes.
- UI for both: a flow builder and a guardrails panel, both plain and intuitive.

**Parallel agents.**
- **Agent A, flow model and engine.** The schema, trigger detection, and step steering in the runtime.
- **Agent B, flow builder UI.** Create and edit flows with ordered steps and per step tools.
- **Agent C, guardrail enforcement.** Allow and block enforcement in runtime and gateway, scopes, confirm on write.
- **Agent D, guardrails UI.** The guardrails panel.

**Done when.** A defined flow runs its steps in order with the right tools, a blocked tool cannot be called from anywhere, and confirm on write cannot be bypassed.

**Evals to add.** `flow-adherence`: the agent follows the flow and only uses allowed tools per step. `guardrails`: blocked tools are never called and writes always confirm.

**Commits (examples).** `feat(flows): flow model and runtime steering`, `feat(flows): flow builder ui`, `feat(guardrails): enforcement in runtime and gateway`, `feat(guardrails): guardrails panel`, `test(flows): adherence and guardrail cases`, integration commit `chore(flows): verify flows and guardrails`.

---

## 12. Observability and Analytics

**Goal.** Record every turn and make it readable, so an operator can see what users ask and where things break.

**Build.**
- Logging pipeline: persist messages, retrieved context, tool calls with args and results, actions, latency, errors, and outcomes, all tied to a conversation and an external user id. Redact secrets.
- Conversations: a list and a transcript view that replays a turn including tool calls, actions, and confirmations.
- Analytics: top intents, tool success and failure rates, common failure points, and a per user action trace. Keep the charts minimal and monochrome.

**Parallel agents.**
- **Agent A, logging pipeline.** The write path from the runtime hooks into the log tables with redaction.
- **Agent B, conversations UI.** The list and the transcript replay.
- **Agent C, analytics aggregation.** The queries and rollups.
- **Agent D, analytics UI.** The minimal charts and the trace view.

**Done when.** Every Playground and widget turn shows up in Conversations with a faithful transcript, and Analytics reflects real usage. No secret is ever stored or shown.

**Commits (examples).** `feat(obs): per turn logging with redaction`, `feat(obs): conversations list and transcript`, `feat(analytics): intent and tool success rollups`, `feat(analytics): minimal charts and trace view`, integration commit `chore(obs): verify logging to analytics`.

---

## 13. Demo Sandbox App

**Goal.** A real, small SaaS app with Beckon embedded, so anyone can drive an app by chat end to end. This is the proof, and it powers the marketing hero.

**Package.** `apps/demo`.

**Build.**
- A lightweight CRM and project app: clients, deals, tasks, and a simple profit and loss view, with its own clean UI matching the design system.
- Its own small API described by an OpenAPI spec, imported into a Beckon agent.
- Beckon embedded via `@beckon/react`, with a few client side actions registered (navigate to a record, open a view) and `onIdentify` wired to the demo user.
- Seed data so the demo feels alive on first load.
- A scripted happy path that works reliably, for example: create a client named Acme, open their profit and loss, then add a follow up task. Each write shows the confirm card.

**Parallel agents.**
- **Agent A, demo app core.** The CRM and project UI and its API.
- **Agent B, seed data.** Realistic seed records and a reset.
- **Agent C, Beckon integration.** Embedding the widget, the OpenAPI import, client actions, and onIdentify.
- **Agent D, demo polish.** The happy path reliability, copy, and the hosted demo route used by the marketing hero.

**Done when.** Opening the demo and typing the scripted requests reliably performs the actions with confirmations, and the marketing hero shows this working. Selectors and timing are robust, not flaky.

**Commits (examples).** `feat(demo): crm and project app with api`, `feat(demo): seed data and reset`, `feat(demo): embed beckon with actions and identify`, `feat(demo): reliable happy path and hero route`, integration commit `chore(demo): verify chat driven actions end to end`.

---

## 14. Evals and Quality Gate

**Goal.** Consolidate the golden cases added across sections into one suite that gates every change.

**Build.**
- Collect all case categories: `tool-plan`, `confirmation`, `rag-grounding`, `openapi-mapping`, `gateway-guard`, `flow-adherence`, `guardrails`, `client-actions`, and add `injection` (context or page text that tries to issue instructions is treated as data and never obeyed).
- Each case is an input plus an expected output or a rubric. `pnpm eval` runs the whole suite and reports pass and fail per case.
- Wire the suite into CI so a red eval blocks merge. Run it locally before every integration commit from here on.

**Parallel agents.**
- **Agent A, case consolidation.** Gather and organize all cases into a clear `evals/cases` tree.
- **Agent B, injection cases.** Author the prompt injection set against knowledge content, page content, and tool results.
- **Agent C, CI gate.** A CI workflow that runs typecheck, lint, build, and eval, and fails on any red.

**Done when.** `pnpm eval` runs every category green, and CI blocks a change that breaks any case.

**Commits (examples).** `test(evals): consolidate case tree`, `test(evals): add injection defense cases`, `ci: run typecheck lint build and eval as a gate`, integration commit `chore(evals): verify full suite and ci gate`.

---

## 15. Hardening

**Goal.** A cross cutting pass on security, injection defense, errors, accessibility, and performance, so the product is reliable, not just a demo.

**Build.**
- Security: rotate and scope tokens, encrypt host credentials at rest, redact secrets everywhere, enforce origin allowlists on the embed, set strict CORS on the runtime, add CSP guidance for the embed, and protect against abuse with rate limits beyond the gateway.
- Injection defense: instructions found in knowledge content, host page content, or tool results are data, never commands. The agent acts only on operator config and the end user's chat. Never execute a write without a confirmation. Keep tool sets tight per flow. The injection evals from Section 14 cover this.
- Errors and resilience: every external call has timeouts and retries with backoff, ingestion and tool failures surface clear messages, and the widget degrades gracefully if the runtime is unreachable.
- Accessibility: full keyboard support, visible focus, proper labels and roles, and reduced motion across the whole product including the widget.
- Performance: small embed bundle, lazy load the console, sensible vector query limits, and a quick first paint on the marketing site.

**Parallel agents.**
- **Agent A, security and injection.** Tokens, encryption, redaction, CORS, CSP, and the injection posture.
- **Agent B, errors and resilience.** Timeouts, retries, graceful degradation, and clear failure copy.
- **Agent C, accessibility.** Keyboard, focus, labels, roles, reduced motion.
- **Agent D, performance.** Bundle size, lazy loading, and query limits.

**Done when.** Injection attempts in content do nothing, no secret leaks anywhere, the product is fully keyboard usable, the widget bundle is small, and failures are clear and recoverable.

**Commits (examples).** `feat(security): scope tokens and enforce origins`, `feat(security): encrypt host creds and redact logs`, `fix(resilience): timeouts retries and graceful widget fallback`, `feat(a11y): keyboard focus labels and reduced motion`, `perf(embed): shrink bundle and lazy load console`, integration commit `chore: verify hardening pass`.

---

## 16. Deployment and Self Hosting

**Goal.** Make Beckon easy to run both ways, with finished docs.

**Build.**
- Hosted path: Vercel config for the console and runtime, with environment variable documentation, and the embed served from the same origin or a CDN.
- Self host path: a complete `docker-compose.yml` that runs the app, Postgres with pgvector, Redis, and MinIO, plus a one command bootstrap and migration step.
- Finalize the README: what Beckon is, quick start for both paths, the environment variables, the architecture note, and how to embed.
- Complete the docs site shell from Section 4 with install, SDK reference, OpenAPI import, gateway, and security pages.

**Parallel agents.**
- **Agent A, hosted config.** Vercel setup and env docs.
- **Agent B, self host.** Docker Compose, bootstrap, and migrations.
- **Agent C, README and architecture note.** The top level docs.
- **Agent D, docs site content.** Install, SDK, OpenAPI, gateway, and security pages.

**Done when.** A fresh clone runs locally with one command, deploys to the hosted path cleanly, and the docs let a new developer embed Beckon without help.

**Commits (examples).** `chore(deploy): vercel config and env docs`, `chore(deploy): docker compose self host and bootstrap`, `docs: finalize readme and architecture note`, `docs(site): install sdk openapi gateway and security`, integration commit `chore: verify hosted and self host paths`.

---

## 17. Activation Checklist (the only thing I need from you)

Everything above is built autonomously. To switch it on, provide the following. Until these arrive, use the placeholders in `.env.example` and clearly mark anything that is stubbed.

**Model and embeddings**
- Anthropic API key for Claude (default model).
- OpenAI API key, if you want OpenAI as an option and for embeddings, or tell me which embedding provider to use instead.

**Auth**
- An OAuth provider to enable (for example Google or GitHub) and its client id and secret, or confirm email and password only for now.

**Email**
- A transactional email provider and key (for example Resend) for sign in and password reset, or confirm we skip email flows for now.

**Storage**
- For self host, nothing is needed since MinIO is included. For hosted, an S3 compatible bucket and credentials, or confirm we keep MinIO.

**Hosting**
- Confirm the hosted target (Vercel assumed) and the domain to use for the app and the embed, so snippets and tokens point at the right place. If none yet, I will default to localhost and a placeholder domain.

**Product decisions to confirm or override**
- Default model choice (Claude assumed).
- Demo app shape (a small CRM and project app assumed).
- Whether flows and the deeper analytics ship in the first pass or come right after (assumed they ship, per Section 11 and 12).

Give me the items above and I will wire them into the environment and remove the stubs. Nothing else requires your input.

---

### How to start

Begin at Section 1, run it with its parallel agents and the contract lock first, commit frequently, close it with an integration commit, then move to Section 2, and so on in order through Section 16. Section 17 is the only point that waits on you.
