import { type Embedder, cosineSimilarity } from "./embedder"
import type { RetrievedChunk, Retriever } from "./types"

export interface SourceChunk {
  sourceId: string
  sourceName: string
  content: string
}

/**
 * An in memory retriever over a fixed set of chunks. Embeds the chunks once, then
 * ranks them against each query by cosine similarity. Used for small cases and the
 * grounding evals. The console uses a pgvector backed retriever for real data.
 */
export function inMemoryRetriever(chunks: SourceChunk[], embedder: Embedder, k = 4): Retriever {
  let prepared: { chunk: SourceChunk; vec: number[] }[] | null = null

  return async (query: string): Promise<RetrievedChunk[]> => {
    if (!prepared) {
      const vectors = await embedder.embed(chunks.map((c) => c.content))
      prepared = chunks.map((chunk, i) => ({ chunk, vec: vectors[i] }))
    }
    const [queryVec] = await embedder.embed([query])
    return prepared
      .map((p) => ({
        sourceId: p.chunk.sourceId,
        sourceName: p.chunk.sourceName,
        content: p.chunk.content,
        score: cosineSimilarity(queryVec, p.vec),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
  }
}
