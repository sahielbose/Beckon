import {
  MockServerExecutor,
  type PendingRegistry,
  type PendingResolution,
  type RunContext,
  type RuntimeTool,
  StubProvider,
  runTurn,
} from "@beckon/agent-core"
import type { GuardrailConfig, StreamEvent } from "@beckon/shared"

/** A pending registry that resolves immediately with a scripted decision. */
export function scriptedPending(opts: { confirm: boolean; result?: unknown }): PendingRegistry {
  return {
    async wait(key: string): Promise<PendingResolution> {
      if (key.includes(":cfm_")) {
        return { kind: "confirmation", confirmed: opts.confirm }
      }
      return { kind: "result", status: "ok", result: opts.result ?? { ok: true } }
    },
    settle() {},
  }
}

export function makeTool(partial: Partial<RuntimeTool> & { name: string }): RuntimeTool {
  return {
    description: "",
    parameters: { type: "object", properties: {} },
    kind: "server",
    sideEffect: false,
    requiresConfirmation: false,
    ...partial,
  }
}

const DEFAULT_GUARDRAILS: GuardrailConfig = {
  allowedTools: [],
  blockedTools: [],
  confirmOnWrite: true,
  scopes: [],
}

export interface TurnResult {
  events: StreamEvent[]
  executed: string[]
}

/** Run a single turn with the stub provider and collect the streamed events. */
export async function runTurnCollect(opts: {
  userMessage: string
  tools: RuntimeTool[]
  guardrails?: GuardrailConfig
  confirm?: boolean
  retrieve?: RunContext["retrieve"]
}): Promise<TurnResult> {
  const executed: string[] = []
  const executor = new MockServerExecutor((tool) => {
    executed.push(tool.name)
    return { ok: true }
  })

  const ctx: RunContext = {
    conversationId: "conv_test",
    agentId: "agt_test",
    model: "stub",
    systemPrompt: "",
    history: [],
    userMessage: opts.userMessage,
    tools: opts.tools,
    guardrails: opts.guardrails ?? DEFAULT_GUARDRAILS,
    provider: new StubProvider(),
    serverExecutor: executor,
    pending: scriptedPending({ confirm: opts.confirm ?? true }),
    retrieve: opts.retrieve,
  }

  const events: StreamEvent[] = []
  for await (const event of runTurn(ctx)) {
    events.push(event)
  }
  return { events, executed }
}

export function textOf(events: StreamEvent[]): string {
  return events
    .filter((e): e is Extract<StreamEvent, { type: "token" }> => e.type === "token")
    .map((e) => e.text)
    .join("")
}
