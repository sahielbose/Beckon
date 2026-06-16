import { EMBEDDING_DIMENSIONS } from "@beckon/shared"

/** An embedding provider behind one interface. */
export interface Embedder {
  readonly id: string
  readonly dimensions: number
  embed(texts: string[]): Promise<number[][]>
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1)
}

function hashString(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Deterministic offline embedder. A hashed bag of words mapped into the embedding
 * space and L2 normalized, so cosine similarity ranks by shared terms. Good enough
 * to run retrieval and the grounding evals with no API key. The real semantic
 * embedder is OpenAI, selected when a key is present.
 */
export class StubEmbedder implements Embedder {
  readonly id = "stub"
  readonly dimensions = EMBEDDING_DIMENSIONS

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => this.one(text))
  }

  private one(text: string): number[] {
    const vec = new Array<number>(this.dimensions).fill(0)
    for (const token of tokenize(text)) {
      vec[hashString(token) % this.dimensions] += 1
    }
    let norm = 0
    for (const x of vec) norm += x * x
    norm = Math.sqrt(norm) || 1
    return vec.map((x) => x / norm)
  }
}

/** Cosine similarity of two vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1
  return dot / denom
}
