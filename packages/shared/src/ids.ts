// Stable, prefixed, URL safe identifiers. Works in node and the browser.

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

/** Cryptographically random base62 string of the given length. */
export function randomString(size = 21): string {
  const bytes = new Uint8Array(size)
  globalThis.crypto.getRandomValues(bytes)
  let out = ""
  for (let i = 0; i < size; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

export const ID_PREFIXES = {
  user: "usr",
  organization: "org",
  membership: "mbr",
  agent: "agt",
  apiKey: "key",
  origin: "ori",
  knowledgeSource: "src",
  chunk: "chk",
  toolSpec: "tsp",
  tool: "tool",
  clientAction: "cact",
  gatewayConfig: "gw",
  flow: "flow",
  guardrail: "grd",
  conversation: "conv",
  message: "msg",
  toolCall: "tc",
  actionEvent: "ae",
  session: "sess",
  invitation: "inv",
} as const

export type IdEntity = keyof typeof ID_PREFIXES

/** Generate a prefixed id, for example `agt_a1B2c3...`. */
export function newId(entity: IdEntity, size = 21): string {
  return `${ID_PREFIXES[entity]}_${randomString(size)}`
}
