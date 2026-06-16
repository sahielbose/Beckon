import { chunkText, selectEmbedder } from "@beckon/agent-core"
import { chunks as chunksTable, db, knowledgeSources } from "@beckon/db"
import { eq } from "drizzle-orm"
import { extractFromFile, extractFromUrl } from "./extract"

/**
 * Ingest one knowledge source: extract text, chunk it, embed each chunk, and store
 * the chunks for retrieval. Status moves pending to processing to ready, or error
 * with a clear message. Runs inline (awaited); a BullMQ worker is the path for
 * scale (see DECISIONS).
 */
export async function ingestSource(sourceId: string, fileBuffer?: Buffer): Promise<void> {
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
    } else if (fileBuffer) {
      text = await extractFromFile(source.name, fileBuffer)
    } else {
      throw new Error("This file needs to be uploaded again to re-index.")
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
