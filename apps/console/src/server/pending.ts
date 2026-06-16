import {
  type PendingRegistry,
  type PendingResolution,
  globalPendingRegistry,
} from "@beckon/agent-core"
import { Redis } from "ioredis"

// The pause for confirm registry. The chat stream parks a turn waiting for the
// widget to confirm a write or report an action result, and the action result
// endpoint settles it. In a single process the in memory registry is enough. On
// multi instance or serverless hosting the two requests can land on different
// instances, so when REDIS_URL is set we use a Redis backed registry over the same
// swappable interface. The confirm before write behavior is identical either way.

const KEY_PREFIX = "beckon:pending:"
const DEFAULT_TIMEOUT_MS = 120_000

class RedisPendingRegistry implements PendingRegistry {
  constructor(private readonly redis: Redis) {}

  async wait(key: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<PendingResolution> {
    // A blocking pop needs its own connection so the shared client stays usable.
    const conn = this.redis.duplicate()
    try {
      const seconds = Math.max(1, Math.ceil(timeoutMs / 1000))
      const popped = await conn.blpop(KEY_PREFIX + key, seconds)
      if (!popped) {
        return { kind: "result", status: "error", error: "Timed out waiting for the widget." }
      }
      return JSON.parse(popped[1]) as PendingResolution
    } catch (error) {
      return {
        kind: "result",
        status: "error",
        error: error instanceof Error ? error.message : "Confirmation channel error.",
      }
    } finally {
      conn.disconnect()
    }
  }

  async settle(key: string, resolution: PendingResolution): Promise<void> {
    const listKey = KEY_PREFIX + key
    // Push the resolution for the waiting instance, and expire so an unconsumed
    // resolution never lingers.
    await this.redis
      .multi()
      .rpush(listKey, JSON.stringify(resolution))
      .expire(listKey, Math.ceil(DEFAULT_TIMEOUT_MS / 1000) + 30)
      .exec()
  }
}

let cached: PendingRegistry | null = null

/**
 * The process wide registry. Redis backed when REDIS_URL is set, otherwise the in
 * memory registry so local single process development still works with no Redis.
 */
export function getPendingRegistry(): PendingRegistry {
  if (cached) return cached

  const url = process.env.REDIS_URL
  if (!url) {
    cached = globalPendingRegistry
    return cached
  }

  const g = globalThis as unknown as { __beckonRedis?: Redis }
  if (!g.__beckonRedis) {
    g.__beckonRedis = new Redis(url, { maxRetriesPerRequest: null })
  }
  cached = new RedisPendingRegistry(g.__beckonRedis)
  return cached
}
