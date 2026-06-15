// Secret redaction used by the gateway and the observability log. Never let a
// credential reach a log line. Redaction is keyed on the field name, so it works
// even when we do not know the exact value.

export const REDACTED = "[redacted]"

const SECRET_KEY_PATTERNS: RegExp[] = [
  /authorization/i,
  /^cookie$/i,
  /set-cookie/i,
  /api[-_]?key/i,
  // Any field ending in "token" (token, id_token, access_token, sessionToken)
  // without catching innocuous fields like "token_count".
  /token$/i,
  /secret/i,
  /password/i,
  /passwd/i,
  /private[-_]?key/i,
  /shared[-_]?secret/i,
  /x-beckon-signature/i,
  /bearer/i,
]

function isSecretKey(key: string): boolean {
  return SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key))
}

/**
 * Deep clone a value, replacing any field whose key looks like a secret with the
 * redaction marker. Cycles are handled. Strings, numbers, booleans, and null pass
 * through unchanged unless their key matched.
 */
export function redactSecrets<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object") {
    return value
  }
  if (seen.has(value as object)) {
    return value
  }
  seen.add(value as object)

  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item, seen)) as unknown as T
  }

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = isSecretKey(key) ? REDACTED : redactSecrets(val, seen)
  }
  return out as T
}

/** Redact a flat header map. Header names are matched case insensitively. */
export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, val] of Object.entries(headers)) {
    out[key] = isSecretKey(key) ? REDACTED : val
  }
  return out
}
