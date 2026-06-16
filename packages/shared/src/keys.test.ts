import { describe, expect, it } from "vitest"
import {
  generateKey,
  hashKey,
  isOriginAllowed,
  keyKindOf,
  keyPrefixOf,
  normalizeOrigin,
  timingSafeEqualHex,
} from "./keys"

describe("generateKey", () => {
  it("produces kind prefixed tokens and a stable prefix", () => {
    const secret = generateKey("secret")
    expect(secret.token.startsWith("bsk_")).toBe(true)
    expect(secret.prefix).toBe(keyPrefixOf(secret.token))
    expect(keyKindOf(secret.token)).toBe("secret")

    const embed = generateKey("embed")
    expect(embed.token.startsWith("bpk_")).toBe(true)
    expect(keyKindOf(embed.token)).toBe("embed")
  })

  it("returns null kind for an unknown token", () => {
    expect(keyKindOf("xyz_abc")).toBe(null)
  })
})

describe("hashKey", () => {
  it("is deterministic and differs per token", async () => {
    const a = await hashKey("bsk_one")
    const b = await hashKey("bsk_one")
    const c = await hashKey("bsk_two")
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toHaveLength(64)
  })
})

describe("timingSafeEqualHex", () => {
  it("compares equal and unequal hashes", () => {
    expect(timingSafeEqualHex("abcd", "abcd")).toBe(true)
    expect(timingSafeEqualHex("abcd", "abce")).toBe(false)
    expect(timingSafeEqualHex("abcd", "abc")).toBe(false)
  })
})

describe("origins", () => {
  it("normalizes to scheme host and port", () => {
    expect(normalizeOrigin("https://app.example.com/path?q=1")).toBe("https://app.example.com")
    expect(normalizeOrigin("not a url")).toBe(null)
  })

  it("allows only listed origins and rejects empty allowlists", () => {
    expect(isOriginAllowed("https://app.example.com", ["https://app.example.com"])).toBe(true)
    expect(isOriginAllowed("https://evil.example.com", ["https://app.example.com"])).toBe(false)
    expect(isOriginAllowed("https://app.example.com", [])).toBe(false)
    expect(isOriginAllowed(null, ["https://app.example.com"])).toBe(false)
  })
})
