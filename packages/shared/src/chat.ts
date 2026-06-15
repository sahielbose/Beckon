import { z } from "zod"
import { messageRole } from "./enums"
import { clientActionDefinition, clientToolDeclaration } from "./tools"

export const chatMessage = z.object({
  role: messageRole,
  content: z.string(),
})
export type ChatMessage = z.infer<typeof chatMessage>

/** POST /api/session: open a session for an embed. */
export const sessionRequest = z.object({
  agentId: z.string(),
  externalUserId: z.string().nullish(),
  origin: z.string().nullish(),
})
export type SessionRequest = z.infer<typeof sessionRequest>

export const sessionResponse = z.object({
  sessionId: z.string(),
  agentId: z.string(),
})
export type SessionResponse = z.infer<typeof sessionResponse>

/** POST /api/chat: send a message and stream the turn over SSE. */
export const chatRequest = z.object({
  sessionId: z.string(),
  message: z.string().min(1),
  // Host functions and UI actions available in the current page, declared by the widget.
  clientTools: z.array(clientToolDeclaration).optional(),
  clientActions: z.array(clientActionDefinition.partial({ id: true })).optional(),
})
export type ChatRequest = z.infer<typeof chatRequest>
