# Security

How Beckon protects operators, their users, and their host backends.

## Side effects are gated

Anything that sends, posts, files, charges, or changes settings is a side effect.
Side effects never run until the end user confirms. This is enforced in three
places: the runtime (`packages/agent-core` pauses the loop for a confirmation), the
gateway (writes default to requires confirmation), and the widget (the confirm card).
A write is never retried, so a confirmed action runs exactly once.

## Prompt injection

Content from retrieved documents, host pages, and tool results is treated as data,
never as instructions. Only the operator configuration and the end user's chat are
instructions. The system prompt states this rule, and the `injection` evals verify
that instructions hidden in retrieved content, impersonated user text, and tool
results are not obeyed.

## The gateway

Every server tool call passes through the Beckon Gateway, which:

- validates arguments against the operation schema and rejects malformed calls,
- restricts calls to the allow listed operations,
- rate limits per agent,
- attaches the operator's host credential (encrypted at rest with AES-256-GCM),
- signs each request with a shared secret so the host can verify it came from Beckon,
- retries idempotent reads with backoff, and never retries writes,
- logs every request and response with secrets redacted.

The `gateway-guard` evals verify rejection, rate limiting, write safety, and that no
secret reaches a log line.

## Tokens and tenancy

- Secret API keys are shown once, then only a prefix plus a SHA-256 hash are stored.
- Embed tokens are public, scoped to one agent, and validated against that agent's
  origin allowlist on every session and chat request.
- Every console query is scoped to the caller's organization. Cross tenant access is
  blocked and tested.

## Transport

- The runtime sets strict response headers (nosniff, frame options, referrer policy,
  permissions policy) and per route CORS on the embed endpoints.
- For the embed, restrict the script source in your host page's Content Security
  Policy to your Beckon origin.

## Reporting

This is an early open source build. Please open an issue for any security concern.
