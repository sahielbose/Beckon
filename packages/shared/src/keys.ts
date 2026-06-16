import { randomString } from "./ids"

// API key and embed token scheme.
//
// Two kinds of credential:
//   secret (bsk_...)  a server side key for management API calls. Shown once.
//   embed  (bpk_...)  a scoped public token for the widget, tied to one agent and
//                     validated against that agent's allowed origins.
//
// We store only a short plaintext prefix (for display and lookup) plus a SHA-256
// hash of the full token. The full token is shown exactly once, at creation.

export const KEY_KINDS = {
  secret: "bsk",
  embed: "bpk",
} as const

export type KeyKind = keyof typeof KEY_KINDS

const PREFIX_LENGTH = 12

/** Generate a new credential. The token is the only time the full value exists. */
export function generateKey(kind: KeyKind): { token: string; prefix: string } {
  const token = `${KEY_KINDS[kind]}_${randomString(40)}`
  return { token, prefix: keyPrefixOf(token) }
}

/** The stored, displayable prefix of a token, for example `bsk_AbC12dEf`. */
export function keyPrefixOf(token: string): string {
  return token.slice(0, PREFIX_LENGTH)
}

/** Which kind a token is, by its prefix, or null if unrecognized. */
export function keyKindOf(token: string): KeyKind | null {
  const head = token.split("_", 1)[0]
  for (const [kind, prefix] of Object.entries(KEY_KINDS)) {
    if (prefix === head) return kind as KeyKind
  }
  return null
}

/** SHA-256 hex of a token. Works in node 20+ and the browser via Web Crypto. */
export async function hashKey(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Constant time compare of two hex strings of equal length. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Normalize an origin to scheme://host[:port] for allowlist comparison. Returns
 * null when the value is not a valid absolute origin.
 */
export function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value)
    return url.origin
  } catch {
    return null
  }
}

/** Whether a request origin is permitted by an agent's allowlist. */
export function isOriginAllowed(origin: string | null, allowed: string[]): boolean {
  if (allowed.length === 0) return false
  const normalized = origin ? normalizeOrigin(origin) : null
  if (!normalized) return false
  return allowed.some((entry) => normalizeOrigin(entry) === normalized)
}
