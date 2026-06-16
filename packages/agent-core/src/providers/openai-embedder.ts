import { EMBEDDING_DIMENSIONS } from "@beckon/shared"
import OpenAI from "openai"
import type { Embedder } from "../embedder"

// Real OpenAI embedder. Selected only when configured. Unverified until a key is
// wired in Section 17.
export class OpenAIEmbedder implements Embedder {
  readonly id = "openai"
  readonly dimensions = EMBEDDING_DIMENSIONS
  private readonly client: OpenAI

  constructor(
    apiKey: string,
    private readonly model = "text-embedding-3-small",
  ) {
    this.client = new OpenAI({ apiKey })
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return []
    const response = await this.client.embeddings.create({ model: this.model, input: texts })
    return response.data.map((d) => d.embedding)
  }
}
