import Anthropic from "@anthropic-ai/sdk"
import type {
  ChatProvider,
  ProviderChunk,
  ProviderRequest,
  ProviderTool,
  RunMessage,
} from "../types"

// Real Anthropic provider. Selected only when ANTHROPIC_API_KEY is set. Unverified
// until a key is wired in Section 17, so it is the non default path.

function normalizeSchema(parameters: Record<string, unknown>): Anthropic.Tool.InputSchema {
  const base = parameters && typeof parameters === "object" ? parameters : {}
  return { type: "object", ...base } as Anthropic.Tool.InputSchema
}

function toMessages(messages: RunMessage[]): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = []
  for (const m of messages) {
    if (m.role === "system") continue
    if (m.role === "user") {
      out.push({ role: "user", content: m.content })
    } else if (m.role === "assistant") {
      const blocks: Array<Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam> = []
      if (m.content) blocks.push({ type: "text", text: m.content })
      for (const tc of m.toolCalls ?? []) {
        blocks.push({ type: "tool_use", id: tc.id, name: tc.name, input: tc.args })
      }
      out.push({ role: "assistant", content: blocks.length > 0 ? blocks : m.content })
    } else {
      out.push({
        role: "user",
        content: [{ type: "tool_result", tool_use_id: m.toolCallId, content: m.content }],
      })
    }
  }
  return out
}

export class AnthropicProvider implements ChatProvider {
  readonly id = "anthropic"
  private readonly client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async *stream(req: ProviderRequest): AsyncIterable<ProviderChunk> {
    const tools = req.tools.map((t: ProviderTool) => ({
      name: t.name,
      description: t.description,
      input_schema: normalizeSchema(t.parameters),
    }))

    const stream = this.client.messages.stream({
      model: req.model,
      max_tokens: 1024,
      system: req.system,
      messages: toMessages(req.messages),
      ...(tools.length > 0 ? { tools } : {}),
    })

    const partials = new Map<number, { id: string; name: string; json: string }>()

    for await (const event of stream) {
      if (event.type === "content_block_start" && event.content_block.type === "tool_use") {
        partials.set(event.index, {
          id: event.content_block.id,
          name: event.content_block.name,
          json: "",
        })
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          yield { type: "text", text: event.delta.text }
        } else if (event.delta.type === "input_json_delta") {
          const entry = partials.get(event.index)
          if (entry) entry.json += event.delta.partial_json
        }
      } else if (event.type === "content_block_stop") {
        const entry = partials.get(event.index)
        if (entry) {
          let args: Record<string, unknown> = {}
          try {
            args = entry.json ? JSON.parse(entry.json) : {}
          } catch {
            args = {}
          }
          yield { type: "tool_call", id: entry.id, name: entry.name, args }
          partials.delete(event.index)
        }
      }
    }

    const final = await stream.finalMessage()
    const reason =
      final.stop_reason === "tool_use"
        ? "tool_calls"
        : final.stop_reason === "max_tokens"
          ? "length"
          : "stop"
    yield { type: "finish", reason }
  }
}
