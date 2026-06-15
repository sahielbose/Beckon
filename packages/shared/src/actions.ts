import { z } from "zod"
import { actionStatus, clientActionType, toolCallStatus } from "./enums"

// A concrete UI action the agent asks the widget to run in the host page.
export const clientActionRequest = z.object({
  actionType: clientActionType,
  // CSS selector or a data-beckon-* target for click and fill.
  target: z.string().optional(),
  // Value to type for fill.
  value: z.string().optional(),
  // Destination for navigate.
  url: z.string().optional(),
  // Free form parameters for custom host functions.
  params: z.record(z.string(), z.unknown()).optional(),
})
export type ClientActionRequest = z.infer<typeof clientActionRequest>

/**
 * The typed event stream the runtime sends to the widget over SSE. Every turn is
 * a sequence of these events. Side effecting tools and actions are surfaced as a
 * confirmation_request first and never execute before a confirmed result.
 */
export const streamEvent = z.discriminatedUnion("type", [
  z.object({ type: z.literal("token"), text: z.string() }),
  z.object({
    type: z.literal("tool_call"),
    id: z.string(),
    name: z.string(),
    args: z.record(z.string(), z.unknown()),
    sideEffect: z.boolean(),
    requiresConfirmation: z.boolean(),
  }),
  z.object({
    type: z.literal("tool_result"),
    id: z.string(),
    name: z.string(),
    status: toolCallStatus,
    result: z.unknown().optional(),
    error: z.string().optional(),
  }),
  z.object({
    type: z.literal("action_request"),
    id: z.string(),
    name: z.string(),
    action: clientActionRequest,
    sideEffect: z.boolean(),
    requiresConfirmation: z.boolean(),
  }),
  z.object({
    type: z.literal("action_result"),
    id: z.string(),
    status: actionStatus,
    result: z.unknown().optional(),
    error: z.string().optional(),
  }),
  z.object({
    type: z.literal("confirmation_request"),
    id: z.string(),
    kind: z.enum(["tool", "action"]),
    name: z.string(),
    // Plain language summary of exactly what will happen, shown on the confirm card.
    summary: z.string(),
    preview: z.record(z.string(), z.unknown()).optional(),
  }),
  z.object({
    type: z.literal("citation"),
    id: z.string(),
    sourceId: z.string(),
    sourceName: z.string(),
    snippet: z.string(),
  }),
  z.object({
    type: z.literal("done"),
    messageId: z.string(),
    finishReason: z.string().optional(),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
    code: z.string().optional(),
  }),
])
export type StreamEvent = z.infer<typeof streamEvent>
export type StreamEventType = StreamEvent["type"]

/**
 * What the widget reports back to the runtime: the outcome of a client action, or
 * the user's decision on a confirmation request.
 */
export const actionResultInput = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("action_result"),
    sessionId: z.string(),
    requestId: z.string(),
    status: actionStatus,
    result: z.unknown().optional(),
    error: z.string().optional(),
  }),
  z.object({
    type: z.literal("confirmation"),
    sessionId: z.string(),
    requestId: z.string(),
    confirmed: z.boolean(),
  }),
  z.object({
    type: z.literal("tool_result"),
    sessionId: z.string(),
    requestId: z.string(),
    status: toolCallStatus,
    result: z.unknown().optional(),
    error: z.string().optional(),
  }),
])
export type ActionResultInput = z.infer<typeof actionResultInput>
