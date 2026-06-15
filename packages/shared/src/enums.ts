import { z } from "zod"

// Shared enumerations. Stored as text in the database (see packages/db) and
// validated with these schemas at every boundary.

export const membershipRole = z.enum(["owner", "admin", "member"])
export type MembershipRole = z.infer<typeof membershipRole>

export const agentStatus = z.enum(["draft", "live"])
export type AgentStatus = z.infer<typeof agentStatus>

export const apiKeyType = z.enum(["secret", "embed_public"])
export type ApiKeyType = z.infer<typeof apiKeyType>

export const knowledgeSourceType = z.enum(["file", "url"])
export type KnowledgeSourceType = z.infer<typeof knowledgeSourceType>

export const knowledgeSourceStatus = z.enum(["pending", "processing", "ready", "error"])
export type KnowledgeSourceStatus = z.infer<typeof knowledgeSourceStatus>

export const toolSpecType = z.enum(["openapi", "mcp", "client"])
export type ToolSpecType = z.infer<typeof toolSpecType>

export const httpMethod = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"])
export type HttpMethod = z.infer<typeof httpMethod>

export const clientActionType = z.enum(["navigate", "click", "fill", "custom"])
export type ClientActionType = z.infer<typeof clientActionType>

export const gatewayAuthType = z.enum(["header", "bearer", "none"])
export type GatewayAuthType = z.infer<typeof gatewayAuthType>

export const conversationStatus = z.enum(["active", "ended", "error"])
export type ConversationStatus = z.infer<typeof conversationStatus>

export const messageRole = z.enum(["user", "assistant", "system", "tool"])
export type MessageRole = z.infer<typeof messageRole>

export const toolCallStatus = z.enum([
  "pending",
  "awaiting_confirmation",
  "running",
  "success",
  "error",
  "rejected",
])
export type ToolCallStatus = z.infer<typeof toolCallStatus>

export const actionStatus = z.enum(["pending", "awaiting_confirmation", "ok", "error", "rejected"])
export type ActionStatus = z.infer<typeof actionStatus>

export const modelProvider = z.enum(["anthropic", "openai"])
export type ModelProvider = z.infer<typeof modelProvider>
