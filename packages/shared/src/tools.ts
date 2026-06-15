import { z } from "zod"
import { clientActionType, httpMethod, toolSpecType } from "./enums"

// A tool's parameters are described by a JSON Schema object. We store it as an
// opaque record and validate concrete arguments against it at call time.
export const jsonSchema = z.record(z.string(), z.unknown())
export type JsonSchema = z.infer<typeof jsonSchema>

/**
 * A tool the agent can call. Server tools (openapi, mcp) are executed through the
 * Beckon Gateway. Client tools are executed in the host page by the widget.
 */
export const toolDefinition = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parametersSchema: jsonSchema,
  source: toolSpecType,
  sideEffect: z.boolean(),
  requiresConfirmation: z.boolean(),
  enabled: z.boolean().default(true),
  // Server tool routing, present for openapi and mcp sources.
  httpMethod: httpMethod.optional(),
  pathTemplate: z.string().optional(),
})
export type ToolDefinition = z.infer<typeof toolDefinition>

/**
 * A UI action the agent can ask the widget to perform in the host page.
 */
export const clientActionDefinition = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  actionType: clientActionType,
  target: z.string().nullish(),
  paramsSchema: jsonSchema,
  sideEffect: z.boolean(),
  requiresConfirmation: z.boolean(),
  enabled: z.boolean().default(true),
})
export type ClientActionDefinition = z.infer<typeof clientActionDefinition>

/**
 * A host function the embedding app registers at runtime. Declared to the runtime
 * so the model knows it can be called; executed back in the host page.
 */
export const clientToolDeclaration = z.object({
  name: z.string(),
  description: z.string(),
  parametersSchema: jsonSchema.default({}),
  sideEffect: z.boolean().default(false),
})
export type ClientToolDeclaration = z.infer<typeof clientToolDeclaration>
