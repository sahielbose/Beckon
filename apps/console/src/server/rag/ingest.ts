import { getObject } from "@/server/storage/s3"
import { chunkText, selectEmbedder } from "@beckon/agent-core"
import { chunks as chunksTable, db, knowledgeSources } from "@beckon/db"
import { eq } from "drizzle-orm"
import { extractFromFile, extractFromUrl } from "./extract"

/**
 * Ingest one knowledge source: extract text, chunk it, embed each chunk, and store
 * the chunks for retrieval. Status moves pending to processing to ready, or error
 * with a clear message.
 *
 * File sources are read from object storage by their stored key, so re-indexing
 * never requires re-uploading. The optional buffer is only used on the offline
 * path where storage is not configured and the file is ingested once in hand.
 */
export async function ingestSource(
  sourceId: string,
  opts: { buffer?: Buffer } = {},
): Promise<void> {
  const source = (
    await db.select().from(knowledgeSources).where(eq(knowledgeSources.id, sourceId)).limit(1)
  )[0]
  if (!source) return

  try {
    await db
      .update(knowledgeSources)
      .set({ status: "processing", error: null })
      .where(eq(knowledgeSources.id, sourceId))

    let text = ""
    if (source.type === "url") {
      text = await extractFromUrl(source.sourceUri ?? "")
    } else if (opts.buffer) {
      text = await extractFromFile(source.name, opts.buffer)
    } else if (source.storageKey) {
      const buffer = await getObject(source.storageKey)
      text = await extractFromFile(source.name, buffer)
    } else {
      throw new Error("The original file is no longer available. Add it again.")
    }

    text = text.trim()
    if (!text) throw new Error("No readable text was found in this source.")

    const chunked = chunkText(text)
    if (chunked.length === 0) throw new Error("No readable text was found in this source.")

    const embedder = await selectEmbedder()
    const vectors = await embedder.embed(chunked.map((c) => c.content))

    await db.delete(chunksTable).where(eq(chunksTable.sourceId, sourceId))
    await db.insert(chunksTable).values(
      chunked.map((chunk, i) => ({
        sourceId,
        agentId: source.agentId,
        content: chunk.content,
        embedding: vectors[i],
        metadata: { index: chunk.index },
        tokenCount: Math.ceil(chunk.content.length / 4),
      })),
    )

    await db
      .update(knowledgeSources)
      .set({ status: "ready", sizeBytes: text.length, error: null })
      .where(eq(knowledgeSources.id, sourceId))
  } catch (error) {
    await db
      .update(knowledgeSources)
      .set({
        status: "error",
        error: error instanceof Error ? error.message : "Ingestion failed.",
      })
      .where(eq(knowledgeSources.id, sourceId))
  }
}
