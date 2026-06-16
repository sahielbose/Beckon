import {
  type RunContext,
  type RuntimeTool,
  type TurnLogger,
  detectFlow,
  selectProvider,
} from "@beckon/agent-core"
import { globalPendingRegistry } from "@beckon/agent-core"
import {
  actionEvents as actionEventsTable,
  agents,
  allowedOrigins,
  apiKeys,
  clientActions as clientActionsTable,
  conversations,
  db,
  flows as flowsTable,
  gatewayConfigs as gatewayConfigsTable,
  guardrails as guardrailsTable,
  messages as messagesTable,
  toolCalls as toolCallsTable,
  tools as toolsTable,
} from "@beckon/db"
import { type GatewayConfig, GatewayServerExecutor } from "@beckon/gateway"
import {
  type ClientActionDefinition,
  type ClientToolDeclaration,
  type GuardrailConfig,
  hashKey,
  isOriginAllowed,
} from "@beckon/shared"
import { and, asc, eq, isNull } from "drizzle-orm"
import { makeRetriever } from "./rag/retriever"

/** Validate an embed token and origin. Returns the scoped agent id, or an error. */
export async function validateEmbed(
  token: string | null,
  origin: string | null,
): Promise<{ agentId: string } | { error: string }> {
  if (!token) return { error: "Missing embed token." }
  const keyHash = await hashKey(token)
  const row = (
    await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyHash, keyHash),
          eq(apiKeys.type, "embed_public"),
          isNull(apiKeys.revokedAt),
        ),
      )
      .limit(1)
  )[0]
  if (!row?.agentId) return { error: "Invalid embed token." }

  const origins = await db
    .select({ origin: allowedOrigins.origin })
    .from(allowedOrigins)
    .where(eq(allowedOrigins.agentId, row.agentId))
  if (
    !isOriginAllowed(
      origin,
      origins.map((o) => o.origin),
    )
  ) {
    return { error: "This origin is not on the allowlist for this agent." }
  }

  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id))
  return { agentId: row.agentId }
}

/** Load the gateway config for an agent, ready for the gateway executor. */
export async function loadGatewayConfig(agentId: string): Promise<GatewayConfig | null> {
  const row = (
    await db
      .select()
      .from(gatewayConfigsTable)
      .where(eq(gatewayConfigsTable.agentId, agentId))
      .limit(1)
  )[0]
  if (!row) return null
  return {
    agentId,
    baseUrl: row.baseUrl,
    authType: row.authType,
    authHeaderName: row.authHeaderName,
    authSecretEncrypted: row.authSecretEncrypted,
    sharedSecretEncrypted: row.sharedSecretEncrypted,
    rateLimitPerMin: row.rateLimitPerMin,
    allowedOperations: row.allowedOperations,
  }
}

export async function loadGuardrails(agentId: string): Promise<GuardrailConfig> {
  const row = (
    await db.select().from(guardrailsTable).where(eq(guardrailsTable.agentId, agentId)).limit(1)
  )[0]
  return {
    allowedTools: row?.allowedTools ?? [],
    blockedTools: row?.blockedTools ?? [],
    confirmOnWrite: row?.confirmOnWrite ?? true,
    scopes: row?.scopes ?? [],
  }
}

/** Build the tool set: server tools and client actions from the database, plus
 *  any host functions the widget declared this turn. */
export async function loadRuntimeTools(
  agentId: string,
  clientToolDecls: ClientToolDeclaration[] = [],
  clientActionDecls: Partial<ClientActionDefinition>[] = [],
): Promise<RuntimeTool[]> {
  const [dbTools, dbActions] = await Promise.all([
    db
      .select()
      .from(toolsTable)
      .where(and(eq(toolsTable.agentId, agentId), eq(toolsTable.enabled, true))),
    db
      .select()
      .from(clientActionsTable)
      .where(and(eq(clientActionsTable.agentId, agentId), eq(clientActionsTable.enabled, true))),
  ])

  const runtime: RuntimeTool[] = []

  for (const t of dbTools) {
    runtime.push({
      name: t.name,
      description: t.description,
      parameters: t.parametersSchema,
      kind: "server",
      sideEffect: t.sideEffect,
      requiresConfirmation: t.requiresConfirmation,
      routing: { method: t.httpMethod, path: t.pathTemplate, toolSpecId: t.toolSpecId },
    })
  }

  for (const a of dbActions) {
    runtime.push({
      name: a.name,
      description: a.description,
      parameters: a.paramsSchema,
      kind: "action",
      actionType: a.actionType,
      sideEffect: a.sideEffect,
      requiresConfirmation: a.requiresConfirmation,
    })
  }

  for (const c of clientToolDecls) {
    runtime.push({
      name: c.name,
      description: c.description,
      parameters: c.parametersSchema,
      kind: "client",
      sideEffect: c.sideEffect,
      requiresConfirmation: c.sideEffect,
    })
  }

  for (const a of clientActionDecls) {
    if (!a.name) continue
    runtime.push({
      name: a.name,
      description: a.description ?? "",
      parameters: a.paramsSchema ?? { type: "object", properties: {} },
      kind: "action",
      actionType: a.actionType ?? "custom",
      sideEffect: a.sideEffect ?? false,
      requiresConfirmation: a.requiresConfirmation ?? Boolean(a.sideEffect),
    })
  }

  return runtime
}

/** Load prior conversation messages as plain history (tool detail is per turn). */
export async function loadHistory(conversationId: string): Promise<RunContext["history"]> {
  const rows = await db
    .select({ role: messagesTable.role, content: messagesTable.content })
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(asc(messagesTable.createdAt))
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content }))
}

export interface BuildContextInput {
  conversationId: string
  agentId: string
  externalUserId?: string | null
  userMessage: string
  clientTools?: ClientToolDeclaration[]
  clientActions?: Partial<ClientActionDefinition>[]
}

/** Assemble a RunContext for one turn. The server executor is the mock until the
 *  gateway lands in Section 8; the pending registry is process wide. */
export async function buildRunContext(input: BuildContextInput): Promise<RunContext | null> {
  const agent = (await db.select().from(agents).where(eq(agents.id, input.agentId)).limit(1))[0]
  if (!agent) return null

  const [guardrails, tools, history, gatewayConfig, agentFlows] = await Promise.all([
    loadGuardrails(input.agentId),
    loadRuntimeTools(input.agentId, input.clientTools, input.clientActions),
    loadHistory(input.conversationId),
    loadGatewayConfig(input.agentId),
    db
      .select()
      .from(flowsTable)
      .where(and(eq(flowsTable.agentId, input.agentId), eq(flowsTable.enabled, true))),
  ])

  const provider = await selectProvider(agent.model)

  // Steer through an active flow: narrow the tools and inject step guidance.
  const activeFlow = detectFlow(
    input.userMessage,
    agentFlows.map((f) => ({ name: f.name, trigger: f.trigger, steps: f.steps })),
  )
  const systemPrompt = activeFlow
    ? `${agent.systemPrompt}\n\nYou are in the "${activeFlow.name}" flow. Follow these steps in order and only use the tools they allow:\n${activeFlow.guidance}`
    : agent.systemPrompt

  return {
    conversationId: input.conversationId,
    agentId: input.agentId,
    externalUserId: input.externalUserId ?? null,
    model: agent.model,
    systemPrompt,
    persona: agent.persona,
    history,
    userMessage: input.userMessage,
    tools,
    guardrails,
    provider,
    // Every server tool call goes through the gateway.
    serverExecutor: new GatewayServerExecutor(gatewayConfig),
    pending: globalPendingRegistry,
    retrieve: makeRetriever(input.agentId),
    flowAllowedTools:
      activeFlow && activeFlow.allowedTools.length > 0 ? activeFlow.allowedTools : null,
  }
}

/** Persist tool calls and action events as they happen (Section 12 expands this). */
export function makeTurnLogger(conversationId: string): TurnLogger {
  return async (event) => {
    if (event.type === "tool_call") {
      await db.insert(toolCallsTable).values({
        conversationId,
        name: event.name,
        args: event.args,
        result: event.result ?? null,
        status: event.status,
        error: event.error,
        requiresConfirmation: event.requiresConfirmation,
        confirmedAt: event.confirmedAt,
        latencyMs: event.latencyMs,
      })
    } else if (event.type === "action_event") {
      await db.insert(actionEventsTable).values({
        conversationId,
        actionType: event.actionType,
        payload: event.payload,
        status: event.status,
        confirmedAt: event.confirmedAt,
        result: event.result ?? null,
      })
    }
  }
}

export { globalPendingRegistry }
export { conversations, messagesTable }
