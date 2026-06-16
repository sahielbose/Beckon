import { createHmac } from "node:crypto"
import { redactHeaders, redactSecrets } from "@beckon/shared"
import { decryptSecret } from "./crypto"
import type { ParsedOperation } from "./openapi"
import { checkRateLimit } from "./ratelimit"
import { validateArgs } from "./validate"

export interface GatewayConfig {
  agentId: string
  baseUrl: string
  authType: "header" | "bearer" | "none"
  authHeaderName?: string | null
  authSecretEncrypted?: string | null
  sharedSecretEncrypted?: string | null
  rateLimitPerMin: number
  /** Allowed operation ids. Empty means all operations are allowed. */
  allowedOperations: string[]
}

export interface GatewayLogEntry {
  operationId: string
  method: string
  url: string
  requestHeaders: Record<string, string>
  requestBody?: unknown
  status?: number
  responseBody?: unknown
  error?: string
  latencyMs: number
  allowed: boolean
}

export interface GatewayCallResult {
  ok: boolean
  status?: number
  result?: unknown
  error?: string
  log: GatewayLogEntry
}

type FetchLike = typeof fetch

function joinUrl(base: string, path: string): string {
  if (!base) return path
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}

/**
 * The Beckon Gateway. Every server tool call passes through here: validated
 * against the operation schema, restricted to allowed operations, rate limited,
 * authenticated with the operator's credential, signed with the shared secret, and
 * logged with secrets redacted. Malformed or disallowed calls are rejected before
 * any request leaves Beckon.
 */
export async function callOperation(
  config: GatewayConfig,
  operation: ParsedOperation,
  args: Record<string, unknown>,
  deps: { fetch?: FetchLike; now?: () => number } = {},
): Promise<GatewayCallResult> {
  const fetchImpl = deps.fetch ?? fetch
  const startedAt = deps.now?.() ?? Date.now()
  const baseLog: GatewayLogEntry = {
    operationId: operation.operationId,
    method: operation.method,
    url: "",
    requestHeaders: {},
    allowed: true,
    latencyMs: 0,
  }
  const finishLog = (extra: Partial<GatewayLogEntry>): GatewayLogEntry => ({
    ...baseLog,
    ...extra,
    latencyMs: (deps.now?.() ?? Date.now()) - startedAt,
  })

  // 1. Allowed operations.
  if (
    config.allowedOperations.length > 0 &&
    !config.allowedOperations.includes(operation.operationId)
  ) {
    return {
      ok: false,
      error: "This operation is not allowed for this agent.",
      log: finishLog({ allowed: false, error: "operation not allowed" }),
    }
  }

  // 2. Validate arguments against the operation schema.
  const validation = validateArgs(operation.parametersSchema ?? {}, args)
  if (!validation.ok) {
    return {
      ok: false,
      error: `The call was malformed: ${validation.errors.join("; ")}`,
      log: finishLog({ error: "validation failed" }),
    }
  }

  // 3. Rate limit per agent.
  const limit = checkRateLimit(`${config.agentId}:gateway`, config.rateLimitPerMin, startedAt)
  if (!limit.ok) {
    return {
      ok: false,
      error: "The rate limit for this agent was reached. Try again shortly.",
      log: finishLog({ error: "rate limited" }),
    }
  }

  // 4. Build the request from flat args.
  let path = operation.path
  const query = new URLSearchParams()
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "Beckon-Gateway/1.0",
  }
  const body: Record<string, unknown> = {}

  for (const param of operation.params ?? []) {
    const value = args[param.name]
    if (value === undefined) continue
    if (param.in === "path")
      path = path.replace(`{${param.name}}`, encodeURIComponent(String(value)))
    else if (param.in === "query") query.set(param.name, String(value))
    else if (param.in === "header") headers[param.name] = String(value)
  }
  for (const key of operation.bodyProps ?? []) {
    if (args[key] !== undefined) body[key] = args[key]
  }
  const hasBody = Object.keys(body).length > 0
  const bodyText = hasBody ? JSON.stringify(body) : undefined
  const url = joinUrl(config.baseUrl, path) + (query.toString() ? `?${query}` : "")

  // 5. Operator configured host auth.
  if (config.authType === "bearer" && config.authSecretEncrypted) {
    headers.authorization = `Bearer ${decryptSecret(config.authSecretEncrypted)}`
  } else if (config.authType === "header" && config.authSecretEncrypted && config.authHeaderName) {
    headers[config.authHeaderName] = decryptSecret(config.authSecretEncrypted)
  }

  // 6. Shared secret signature so the host can verify the call came from Beckon.
  if (config.sharedSecretEncrypted) {
    const secret = decryptSecret(config.sharedSecretEncrypted)
    const timestamp = String(startedAt)
    const signed = `${operation.method}\n${path}\n${bodyText ?? ""}\n${timestamp}`
    headers["x-beckon-timestamp"] = timestamp
    headers["x-beckon-signature"] = createHmac("sha256", secret).update(signed).digest("hex")
  }

  // 7. Execute with a timeout. Idempotent reads are retried with backoff. Writes
  //    are never retried, so a side effect is never duplicated.
  const idempotent = operation.method === "GET" || operation.method === "HEAD"
  const maxAttempts = idempotent ? 3 : 1
  let status: number | undefined
  let responseBody: unknown
  let error: string | undefined

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    error = undefined
    try {
      const response = await fetchImpl(url, {
        method: operation.method,
        headers,
        body: bodyText,
        signal: AbortSignal.timeout(15_000),
      })
      status = response.status
      const text = await response.text()
      try {
        responseBody = text ? JSON.parse(text) : null
      } catch {
        responseBody = text
      }
      if (!response.ok) {
        error = `The host returned status ${response.status}.`
        if (idempotent && response.status >= 500 && attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 200))
          continue
        }
      }
      break
    } catch (e) {
      error = e instanceof Error ? e.message : "The request to the host failed."
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 200))
      }
    }
  }

  const log = finishLog({
    url,
    requestHeaders: redactHeaders(headers),
    requestBody: hasBody ? (redactSecrets(body) as Record<string, unknown>) : undefined,
    status,
    responseBody: redactSecrets(responseBody),
    error,
  })

  return { ok: !error, status, result: responseBody, error, log }
}
