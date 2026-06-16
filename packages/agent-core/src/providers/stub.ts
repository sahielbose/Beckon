import type {
  ChatProvider,
  ProviderChunk,
  ProviderRequest,
  ProviderTool,
  RunMessage,
} from "../types"

// Deterministic offline provider. It plans a tool from the last user message by
// keyword overlap with tool names and descriptions, constructs simple arguments,
// and otherwise answers from any reference content present in the system prompt.
// It never acts on instructions found in tool results or reference content, which
// is exactly the injection safe behavior the real models are prompted to follow.

function tokenize(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "you",
  "your",
  "can",
  "get",
  "let",
  "all",
  "are",
  "from",
  "into",
  "out",
])

function keywords(tool: ProviderTool): Set<string> {
  return new Set(
    [...tokenize(tool.name), ...tokenize(tool.description)].filter((w) => !STOPWORDS.has(w)),
  )
}

function lastUserText(messages: RunMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === "user") return m.content
  }
  return ""
}

function planTool(userText: string, tools: ProviderTool[]): ProviderTool | null {
  if (tools.length === 0) return null
  const words = new Set(tokenize(userText).filter((w) => !STOPWORDS.has(w)))
  let best: ProviderTool | null = null
  let bestScore = 0
  for (const tool of tools) {
    const kw = keywords(tool)
    let score = 0
    for (const w of words) if (kw.has(w)) score++
    // Strong bonus when the tool name tokens are present.
    for (const w of tokenize(tool.name)) if (words.has(w)) score += 2
    if (score > bestScore) {
      bestScore = score
      best = tool
    }
  }
  return bestScore >= 2 ? best : null
}

const STRING_PARAM_HINTS = ["name", "title", "query", "q", "search", "term", "text", "subject"]

function extractArgs(userText: string, tool: ProviderTool): Record<string, unknown> {
  const props = (tool.parameters?.properties ?? {}) as Record<string, { type?: string }>
  const args: Record<string, unknown> = {}

  const quoted = userText.match(/["'“”']([^"'“”']{2,})["'“”']/)?.[1]
  const named = userText.match(/\bnamed\s+([A-Za-z0-9][\w .-]*)/i)?.[1]?.trim()
  const forMatch = userText.match(/\bfor\s+([A-Za-z0-9][\w .-]*)/i)?.[1]?.trim()
  const primary = quoted ?? named ?? forMatch ?? userText.trim()

  for (const [key, def] of Object.entries(props)) {
    const isString = !def.type || def.type === "string"
    if (!isString) continue
    if (STRING_PARAM_HINTS.some((h) => key.toLowerCase().includes(h))) {
      args[key] = primary
    }
  }
  // If nothing matched but there is exactly one string property, fill it.
  if (Object.keys(args).length === 0) {
    const stringKeys = Object.entries(props)
      .filter(([, d]) => !d.type || d.type === "string")
      .map(([k]) => k)
    if (stringKeys.length === 1) args[stringKeys[0]] = primary
  }
  return args
}

function parseSources(system: string): { name: string; content: string }[] {
  const out: { name: string; content: string }[] = []
  const re = /\[\[source \d+: (.+?) \(.+?\)\]\]\n([\s\S]*?)(?=\n\[\[source |\s*$)/g
  let match: RegExpExecArray | null
  match = re.exec(system)
  while (match !== null) {
    out.push({ name: match[1], content: match[2].trim() })
    match = re.exec(system)
  }
  return out
}

function shortHash(text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}

async function* words(text: string): AsyncIterable<ProviderChunk> {
  const parts = text.split(/(\s+)/)
  for (const part of parts) {
    if (part) yield { type: "text", text: part }
  }
}

export class StubProvider implements ChatProvider {
  readonly id = "stub"

  async *stream(req: ProviderRequest): AsyncIterable<ProviderChunk> {
    const last = req.messages[req.messages.length - 1]

    // After a tool result, summarize and finish.
    if (last && last.role === "tool") {
      yield* words(`Done. I used ${last.toolName} and have the result.`)
      yield { type: "finish", reason: "stop" }
      return
    }

    const userText = lastUserText(req.messages)
    const tool = planTool(userText, req.tools)
    if (tool) {
      yield {
        type: "tool_call",
        id: `call_${tool.name}_${shortHash(userText)}`,
        name: tool.name,
        args: extractArgs(userText, tool),
      }
      yield { type: "finish", reason: "tool_calls" }
      return
    }

    // No tool. Answer from reference content if present, citing the source.
    const sources = parseSources(req.system)
    if (sources.length > 0) {
      const top = sources[0]
      const snippet = top.content.split(/(?<=[.!?])\s/)[0] ?? top.content.slice(0, 200)
      yield* words(`Based on ${top.name}: ${snippet}`)
      yield { type: "finish", reason: "stop" }
      return
    }

    yield* words(
      "I can help with that. Tell me what you would like to do, or connect tools so I can take actions.",
    )
    yield { type: "finish", reason: "stop" }
  }
}
