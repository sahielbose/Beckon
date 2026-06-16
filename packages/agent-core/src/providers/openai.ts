import OpenAI from "openai"
import type { ChatProvider, ProviderChunk, ProviderRequest, RunMessage } from "../types"

// Real OpenAI provider. Selected only when OPENAI_API_KEY is set. Unverified until
// a key is wired in Section 17, so it is the non default path.

function toMessages(
  system: string,
  messages: RunMessage[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const out: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
  ]
  for (const m of messages) {
    if (m.role === "system") continue
    if (m.role === "user") {
      out.push({ role: "user", content: m.content })
    } else if (m.role === "assistant") {
      out.push({
        role: "assistant",
        content: m.content || null,
        ...(m.toolCalls && m.toolCalls.length > 0
          ? {
              tool_calls: m.toolCalls.map((tc) => ({
                id: tc.id,
                type: "function" as const,
                function: { name: tc.name, arguments: JSON.stringify(tc.args) },
              })),
            }
          : {}),
      })
    } else {
      out.push({ role: "tool", tool_call_id: m.toolCallId, content: m.content })
    }
  }
  return out
}

export class OpenAIProvider implements ChatProvider {
  readonly id = "openai"
  private readonly client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async *stream(req: ProviderRequest): AsyncIterable<ProviderChunk> {
    const tools = req.tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: { type: "object", ...t.parameters },
      },
    }))

    const stream = await this.client.chat.completions.create({
      model: req.model,
      messages: toMessages(req.system, req.messages),
      stream: true,
      ...(tools.length > 0 ? { tools } : {}),
    })

    const partials = new Map<number, { id: string; name: string; args: string }>()
    let finishReason = "stop"

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      if (!choice) continue
      const delta = choice.delta

      if (delta?.content) {
        yield { type: "text", text: delta.content }
      }
      for (const tc of delta?.tool_calls ?? []) {
        const idx = tc.index ?? 0
        const entry = partials.get(idx) ?? { id: tc.id ?? `call_${idx}`, name: "", args: "" }
        if (tc.id) entry.id = tc.id
        if (tc.function?.name) entry.name += tc.function.name
        if (tc.function?.arguments) entry.args += tc.function.arguments
        partials.set(idx, entry)
      }
      if (choice.finish_reason) finishReason = choice.finish_reason
    }

    for (const entry of partials.values()) {
      let args: Record<string, unknown> = {}
      try {
        args = entry.args ? JSON.parse(entry.args) : {}
      } catch {
        args = {}
      }
      yield { type: "tool_call", id: entry.id, name: entry.name, args }
    }

    const reason =
      finishReason === "tool_calls" ? "tool_calls" : finishReason === "length" ? "length" : "stop"
    yield { type: "finish", reason }
  }
}
