import { type Embedder, StubEmbedder } from "../embedder"

/** Pick an embedder. Falls back to the deterministic stub when not configured. */
export async function selectEmbedder(): Promise<Embedder> {
  if (process.env.BECKON_STUB_LLM === "true") return new StubEmbedder()

  if (process.env.EMBEDDING_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    const { OpenAIEmbedder } = await import("./openai-embedder")
    return new OpenAIEmbedder(
      process.env.OPENAI_API_KEY,
      process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    )
  }
  return new StubEmbedder()
}
