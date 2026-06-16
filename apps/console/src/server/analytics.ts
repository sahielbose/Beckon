import { actionEvents, conversations, db, messages, toolCalls } from "@beckon/db"
import { and, asc, count, desc, eq } from "drizzle-orm"

export async function listConversations(agentId: string, limit = 50) {
  return db
    .select({
      id: conversations.id,
      externalUserId: conversations.externalUserId,
      origin: conversations.origin,
      status: conversations.status,
      startedAt: conversations.startedAt,
    })
    .from(conversations)
    .where(eq(conversations.agentId, agentId))
    .orderBy(desc(conversations.startedAt))
    .limit(limit)
}

export async function getConversation(conversationId: string, agentId: string) {
  const conversation = (
    await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.agentId, agentId)))
      .limit(1)
  )[0]
  if (!conversation) return null

  const [msgs, calls, actions] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt)),
    db
      .select()
      .from(toolCalls)
      .where(eq(toolCalls.conversationId, conversationId))
      .orderBy(asc(toolCalls.createdAt)),
    db
      .select()
      .from(actionEvents)
      .where(eq(actionEvents.conversationId, conversationId))
      .orderBy(asc(actionEvents.createdAt)),
  ])

  return { conversation, messages: msgs, toolCalls: calls, actionEvents: actions }
}

export interface ToolStat {
  name: string
  total: number
  success: number
  error: number
  rejected: number
}

export interface AnalyticsSummary {
  totalConversations: number
  totalMessages: number
  toolStats: ToolStat[]
  topIntents: { content: string; count: number }[]
}

export async function getAnalyticsSummary(agentId: string): Promise<AnalyticsSummary> {
  const [convCount, msgCount, calls, intents] = await Promise.all([
    db.select({ c: count() }).from(conversations).where(eq(conversations.agentId, agentId)),
    db
      .select({ c: count() })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .where(eq(conversations.agentId, agentId)),
    db
      .select({ name: toolCalls.name, status: toolCalls.status })
      .from(toolCalls)
      .innerJoin(conversations, eq(conversations.id, toolCalls.conversationId))
      .where(eq(conversations.agentId, agentId)),
    db
      .select({ content: messages.content, c: count() })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .where(and(eq(conversations.agentId, agentId), eq(messages.role, "user")))
      .groupBy(messages.content)
      .orderBy(desc(count()))
      .limit(8),
  ])

  const byTool = new Map<string, ToolStat>()
  for (const call of calls) {
    const name = call.name || "unnamed"
    const stat = byTool.get(name) ?? { name, total: 0, success: 0, error: 0, rejected: 0 }
    stat.total++
    if (call.status === "success") stat.success++
    else if (call.status === "error") stat.error++
    else if (call.status === "rejected") stat.rejected++
    byTool.set(name, stat)
  }

  return {
    totalConversations: convCount[0]?.c ?? 0,
    totalMessages: msgCount[0]?.c ?? 0,
    toolStats: [...byTool.values()].sort((a, b) => b.total - a.total),
    topIntents: intents.map((i) => ({ content: i.content, count: i.c })),
  }
}
