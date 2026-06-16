import { ingestSource } from "@/server/rag/ingest"
import { type ConnectionOptions, Queue } from "bullmq"
import { Redis } from "ioredis"

export const INGESTION_QUEUE = "beckon-ingestion"

export interface IngestionJob {
  sourceId: string
}

let queue: Queue | null = null

function getQueue(): Queue | null {
  const url = process.env.REDIS_URL
  if (!url) return null
  if (!queue) {
    const connection = new Redis(url, { maxRetriesPerRequest: null })
    queue = new Queue(INGESTION_QUEUE, { connection: connection as ConnectionOptions })
  }
  return queue
}

/**
 * Run ingestion for a source. When REDIS_URL is set the work is enqueued to BullMQ
 * so the request returns immediately and a worker does the heavy lifting. With no
 * Redis it runs inline so local single process dev and offline runs still work.
 */
export async function runIngestion(
  sourceId: string,
  opts: { buffer?: Buffer } = {},
): Promise<void> {
  const q = getQueue()
  // A buffer cannot cross the queue boundary, so the offline (no storage) path
  // always ingests inline with the buffer in hand.
  if (q && !opts.buffer) {
    await q.add("ingest", { sourceId } satisfies IngestionJob, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    })
    return
  }
  await ingestSource(sourceId, opts)
}
