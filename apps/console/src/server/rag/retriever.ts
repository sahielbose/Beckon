import { type RetrievedChunk, type Retriever, selectEmbedder } from "@beckon/agent-core"
import { chunks as chunksTable, db, knowledgeSources } from "@beckon/db"
import { eq, sql } from "drizzle-orm"

/** A pgvector backed retriever for an agent's knowledge. Top k by cosine distance. */
export function makeRetriever(agentId: string, k = 5): Retriever {
  return async (query: string): Promise<RetrievedChunk[]> => {
    const embedder = await selectEmbedder()
    const [queryVec] = await embedder.embed([query])
    if (!queryVec) return []
    const literal = `[${queryVec.join(",")}]`

    const rows = await db
      .select({
        sourceId: chunksTable.sourceId,
        sourceName: knowledgeSources.name,
        content: chunksTable.content,
        distance: sql<number>`${chunksTable.embedding} <=> ${literal}::vector`,
      })
      .from(chunksTable)
      .innerJoin(knowledgeSources, eq(knowledgeSources.id, chunksTable.sourceId))
      .where(eq(chunksTable.agentId, agentId))
      .orderBy(sql`${chunksTable.embedding} <=> ${literal}::vector`)
      .limit(k)

    return rows
      .filter((r) => Number(r.distance) < 1)
      .map((r) => ({
        sourceId: r.sourceId,
        sourceName: r.sourceName,
        content: r.content,
        score: 1 - Number(r.distance),
      }))
  }
}
