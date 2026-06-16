import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

// Password hashing with scrypt from node's standard library. Salted, slow by
// design, no third party dependency. Format: scrypt$<saltHex>$<hashHex>.

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const derived = scryptSync(password, salt, KEY_LENGTH).toString("hex")
  return `scrypt$${salt}$${derived}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$")
  if (scheme !== "scrypt" || !salt || !hash) return false
  const expected = Buffer.from(hash, "hex")
  const derived = scryptSync(password, salt, KEY_LENGTH)
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}
