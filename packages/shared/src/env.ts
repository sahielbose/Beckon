// Default constants shared across packages. Real values come from environment
// variables wired in Section 17. Until then the providers run in stub mode.

/** Embedding vector dimension. Matches OpenAI text-embedding-3-small. */
export const EMBEDDING_DIMENSIONS = 1536

/** Default chat model id when none is set on the agent. */
export const DEFAULT_MODEL = "claude-3-5-sonnet-latest"

/** Default per minute rate limit for a gateway config. */
export const DEFAULT_RATE_LIMIT_PER_MIN = 60

/** Methods that mutate state and therefore default to confirm on write. */
export const WRITE_HTTP_METHODS = ["POST", "PUT", "PATCH", "DELETE"] as const

export function isWriteMethod(method: string): boolean {
  return (WRITE_HTTP_METHODS as readonly string[]).includes(method.toUpperCase())
}
