import type { ChatProvider } from "../types"
import { StubProvider } from "./stub"

function wantsOpenAI(model: string): boolean {
  return /^(gpt|o1|o3|o4|chatgpt)/i.test(model)
}

/**
 * Pick a provider for the given model. Falls back to the deterministic stub when
 * no API key is set, or when BECKON_STUB_LLM is true, so the app and the evals run
 * fully offline. Real providers are dynamically imported so their SDKs only load
 * when actually used.
 */
export async function selectProvider(model: string): Promise<ChatProvider> {
  if (process.env.BECKON_STUB_LLM === "true") return new StubProvider()

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (wantsOpenAI(model) && openaiKey) {
    const { OpenAIProvider } = await import("./openai")
    return new OpenAIProvider(openaiKey)
  }
  if (anthropicKey) {
    const { AnthropicProvider } = await import("./anthropic")
    return new AnthropicProvider(anthropicKey)
  }
  if (openaiKey) {
    const { OpenAIProvider } = await import("./openai")
    return new OpenAIProvider(openaiKey)
  }

  return new StubProvider()
}

export function isStubMode(): boolean {
  return (
    process.env.BECKON_STUB_LLM === "true" ||
    (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY)
  )
}
