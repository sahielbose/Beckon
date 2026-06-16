import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

// AES-256-GCM encryption for host credentials at rest. The key comes from
// BECKON_ENCRYPTION_KEY (32 byte base64). A clearly marked dev fallback keeps
// local development working before a real key is set in Section 17.

function encryptionKey(): Buffer {
  const raw = process.env.BECKON_ENCRYPTION_KEY
  if (!raw) {
    // DEV ONLY: deterministic insecure key so local dev works without a real key.
    return createHash("sha256").update("beckon-dev-insecure-key").digest()
  }
  const decoded = Buffer.from(raw, "base64")
  return decoded.length === 32 ? decoded : createHash("sha256").update(raw).digest()
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv)
  let encrypted = cipher.update(plaintext, "utf8", "base64")
  encrypted += cipher.final("base64")
  const tag = cipher.getAuthTag().toString("base64")
  return `${iv.toString("base64")}.${tag}.${encrypted}`
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".")
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Malformed encrypted value.")
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivB64, "base64"))
  decipher.setAuthTag(Buffer.from(tagB64, "base64"))
  let decrypted = decipher.update(dataB64, "base64", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
