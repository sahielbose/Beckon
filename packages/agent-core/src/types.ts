import type { ClientActionType, GuardrailConfig, JsonSchema } from "@beckon/shared"

// ---------------------------------------------------------------------------
// Messages and provider interface
// ---------------------------------------------------------------------------

export type RunMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | {
      role: "assistant"
      content: string
      toolCalls?: { id: string; name: string; args: Record<string, unknown> }[]
    }
  | { role: "tool"; toolCallId: string; toolName: string; content: string }

export interface ProviderTool {
  name: string
  description: string
  parameters: JsonSchema
}

export interface ProviderRequest {
  model: string
  system: string
  messages: RunMessage[]
  tools: ProviderTool[]
}

export type ProviderChunk =
  | { type: "text"; text: string }
  | { type: "tool_call"; id: string; name: string; args: Record<string, unknown> }
  | { type: "finish"; reason: "stop" | "tool_calls" | "length" | "error"; error?: string }

/** A chat model behind one interface: streamed text plus tool calls. */
export interface ChatProvider {
  readonly id: string
  stream(req: ProviderRequest): AsyncIterable<ProviderChunk>
}

// ---------------------------------------------------------------------------
// Tools the runtime can offer
// ---------------------------------------------------------------------------

export type ToolKind = "server" | "client" | "action"

export interface RuntimeTool {
  name: string
  description: string
  parameters: JsonSchema
  kind: ToolKind
  sideEffect: boolean
  requiresConfirmation: boolean
  /** For kind "action": the UI action type. */
  actionType?: ClientActionType
  /** Opaque routing info for server tools (resolved by the executor). */
  routing?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Retrieval
// ---------------------------------------------------------------------------

export interface RetrievedChunk {
  sourceId: string
  sourceName: string
  content: string
  score: number
}

export type Retriever = (query: string) => Promise<RetrievedChunk[]>

// ---------------------------------------------------------------------------
// Server tool execution (through the gateway in Section 8)
// ---------------------------------------------------------------------------

export interface ExecContext {
  conversationId: string
  agentId: string
  externalUserId?: string | null
}

export interface ServerToolExecutor {
  execute(
    tool: RuntimeTool,
    args: Record<string, unknown>,
    ctx: ExecContext,
  ): Promise<{ ok: true; result: unknown } | { ok: false; error: string }>
}

// ---------------------------------------------------------------------------
// Pending registry: the loop pauses for the widget to confirm or report a result
// ---------------------------------------------------------------------------

export type PendingResolution =
  | { kind: "confirmation"; confirmed: boolean }
  | { kind: "result"; status: "ok" | "error"; result?: unknown; error?: string }

export interface PendingRegistry {
  /** Await a resolution for the given key, with a timeout. */
  wait(key: string, timeoutMs?: number): Promise<PendingResolution>
  /** Settle a pending wait. No op if the key is unknown or already settled. */
  settle(key: string, resolution: PendingResolution): void
}

// ---------------------------------------------------------------------------
// Turn logging hooks (persisted in Section 12)
// ---------------------------------------------------------------------------

export type TurnLogEvent =
  | { type: "assistant_message"; content: string }
  | {
      type: "tool_call"
      callId: string
      name: string
      kind: ToolKind
      args: Record<string, unknown>
      status: "success" | "error" | "rejected"
      result?: unknown
      error?: string
      requiresConfirmation: boolean
      confirmedAt?: Date
      latencyMs?: number
    }
  | {
      type: "action_event"
      actionType: ClientActionType
      payload: Record<string, unknown>
      status: "ok" | "error" | "rejected"
      confirmedAt?: Date
      result?: unknown
    }

export type TurnLogger = (event: TurnLogEvent) => void | Promise<void>

// ---------------------------------------------------------------------------
// The run context for a single turn
// ---------------------------------------------------------------------------

export interface RunContext {
  conversationId: string
  agentId: string
  externalUserId?: string | null
  model: string
  systemPrompt: string
  persona?: string | null
  history: RunMessage[]
  userMessage: string
  tools: RuntimeTool[]
  guardrails: GuardrailConfig
  provider: ChatProvider
  serverExecutor: ServerToolExecutor
  pending: PendingRegistry
  retrieve?: Retriever
  log?: TurnLogger
  /** Maximum model calls per turn, a safety bound on the loop. */
  maxSteps?: number
  /** Tools allowed in the active flow step, if any. Narrows the tool set. */
  flowAllowedTools?: string[] | null
}
