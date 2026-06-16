import { ingestSource } from "@/server/rag/ingest"
import { type ConnectionOptions, Worker } from "bullmq"
import { Redis } from "ioredis"
import { INGESTION_QUEUE, type IngestionJob } from "./queue"

// The ingestion worker. Run with `pnpm --filter @beckon/console worker` (or the
// worker service in docker-compose). It pulls jobs enqueued when a knowledge
// source is added, reads the file from storage, and runs the ingest logic.

const url = process.env.REDIS_URL
if (!url) {
  console.error("REDIS_URL is required to run the ingestion worker.")
  process.exit(1)
}

const connection = new Redis(url, { maxRetriesPerRequest: null })

const worker = new Worker<IngestionJob>(
  INGESTION_QUEUE,
  async (job) => {
    await ingestSource(job.data.sourceId)
  },
  { connection: connection as ConnectionOptions, concurrency: 3 },
)

worker.on("completed", (job) => {
  console.log(`Ingested source ${job.data.sourceId}`)
})

worker.on("failed", (job, err) => {
  console.error(`Ingestion failed for ${job?.data.sourceId}:`, err?.message)
})

console.log(`Beckon ingestion worker listening on ${INGESTION_QUEUE}`)

async function shutdown() {
  await worker.close()
  connection.disconnect()
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
