interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/**
 * Fixed window per minute rate limit, keyed per agent. In memory, correct for a
 * single node process. Multi instance hosting needs a Redis backed limiter using
 * the same interface (see DECISIONS).
 */
export function checkRateLimit(
  key: string,
  perMinute: number,
  now = Date.now(),
): { ok: boolean; remaining: number } {
  let bucket = buckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + 60_000 }
    buckets.set(key, bucket)
  }
  if (bucket.count >= perMinute) {
    return { ok: false, remaining: 0 }
  }
  bucket.count++
  return { ok: true, remaining: perMinute - bucket.count }
}

/** Reset all limiter state. For tests. */
export function resetRateLimits(): void {
  buckets.clear()
}
