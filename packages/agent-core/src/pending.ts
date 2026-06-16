import type { PendingRegistry, PendingResolution } from "./types"

interface Entry {
  resolve: (r: PendingResolution) => void
  timer: ReturnType<typeof setTimeout>
}

/**
 * In memory deferred registry. The orchestration loop awaits a resolution keyed by
 * an event id, and the action result endpoint settles it. Correct for a single
 * node process. Multi instance hosting needs a Redis backed implementation of the
 * same interface (see DECISIONS D-017).
 */
export class InMemoryPendingRegistry implements PendingRegistry {
  private entries = new Map<string, Entry>()

  wait(key: string, timeoutMs = 120_000): Promise<PendingResolution> {
    return new Promise<PendingResolution>((resolve) => {
      const timer = setTimeout(() => {
        this.entries.delete(key)
        resolve({ kind: "result", status: "error", error: "Timed out waiting for the widget." })
      }, timeoutMs)
      this.entries.set(key, { resolve, timer })
    })
  }

  settle(key: string, resolution: PendingResolution): void {
    const entry = this.entries.get(key)
    if (!entry) return
    clearTimeout(entry.timer)
    this.entries.delete(key)
    entry.resolve(resolution)
  }
}

/** A process wide registry shared across the console route handlers. */
export const globalPendingRegistry: PendingRegistry = (() => {
  const g = globalThis as unknown as { __beckonPending?: InMemoryPendingRegistry }
  if (!g.__beckonPending) g.__beckonPending = new InMemoryPendingRegistry()
  return g.__beckonPending
})()
