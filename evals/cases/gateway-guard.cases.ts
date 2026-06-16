import {
  type GatewayConfig,
  callOperation,
  encryptSecret,
  parseOpenApi,
  resetRateLimits,
} from "@beckon/gateway"
import { SAMPLE_SPEC } from "../support/spec"
import { check, defineCases } from "../types"

function operations() {
  return parseOpenApi(SAMPLE_SPEC as unknown as Record<string, unknown>).operations
}

function op(id: string) {
  const found = operations().find((o) => o.operationId === id)
  if (!found) throw new Error(`no op ${id}`)
  return found
}

function baseConfig(overrides: Partial<GatewayConfig> = {}): GatewayConfig {
  return {
    agentId: "agt_test",
    baseUrl: "https://api.example.com",
    authType: "none",
    rateLimitPerMin: 60,
    allowedOperations: [],
    ...overrides,
  }
}

function okFetch(calls: string[]): typeof fetch {
  return (async (url: string | URL | Request) => {
    calls.push(String(url))
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }) as typeof fetch
}

export const cases = defineCases("gateway-guard", [
  {
    id: "gateway-guard/rejects-disallowed-operation",
    description: "An operation not on the allowlist is rejected without calling the host",
    run: async () => {
      resetRateLimits()
      const calls: string[] = []
      const result = await callOperation(
        baseConfig({ allowedOperations: ["listClients"] }),
        op("createClient"),
        { name: "Acme" },
        { fetch: okFetch(calls) },
      )
      return check(!result.ok && calls.length === 0, "the disallowed call was not blocked")
    },
  },
  {
    id: "gateway-guard/rejects-malformed-arguments",
    description: "A call missing a required field is rejected before reaching the host",
    run: async () => {
      resetRateLimits()
      const calls: string[] = []
      const result = await callOperation(
        baseConfig(),
        op("createClient"),
        {},
        { fetch: okFetch(calls) },
      )
      return check(!result.ok && calls.length === 0, "the malformed call was not blocked")
    },
  },
  {
    id: "gateway-guard/enforces-rate-limit",
    description: "Calls beyond the per minute limit are rejected",
    run: async () => {
      resetRateLimits()
      const calls: string[] = []
      const config = baseConfig({ rateLimitPerMin: 1 })
      const first = await callOperation(config, op("listClients"), {}, { fetch: okFetch(calls) })
      const second = await callOperation(config, op("listClients"), {}, { fetch: okFetch(calls) })
      return check(first.ok && !second.ok, "the rate limit was not enforced")
    },
  },
  {
    id: "gateway-guard/redacts-secrets-in-logs",
    description: "The auth credential and signature never appear in the request log",
    run: async () => {
      resetRateLimits()
      const calls: string[] = []
      const result = await callOperation(
        baseConfig({
          authType: "bearer",
          authSecretEncrypted: encryptSecret("super-secret-token"),
          sharedSecretEncrypted: encryptSecret("shared-signing-secret"),
        }),
        op("listClients"),
        {},
        { fetch: okFetch(calls) },
      )
      const serialized = JSON.stringify(result.log)
      const leaked =
        serialized.includes("super-secret-token") || serialized.includes("shared-signing-secret")
      const headerRedacted = result.log.requestHeaders.authorization === "[redacted]"
      return check(!leaked && headerRedacted, `leaked=${leaked} headerRedacted=${headerRedacted}`)
    },
  },
])
