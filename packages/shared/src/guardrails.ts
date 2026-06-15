import { z } from "zod"

// Guardrails are enforceable limits on what the agent may do. Enforced in both the
// runtime and the gateway. A blocked tool is never callable. A write without a
// confirmation never executes.

export const guardrailConfig = z.object({
  // Allowed tool names. Empty means all tools are allowed (subject to blocked).
  allowedTools: z.array(z.string()).default([]),
  // Blocked tool names. A blocked tool is never callable, even if also allowed.
  blockedTools: z.array(z.string()).default([]),
  // Confirm before any write. Defaults on and cannot be silently bypassed.
  confirmOnWrite: z.boolean().default(true),
  // Named scopes the agent is permitted to use.
  scopes: z.array(z.string()).default([]),
})
export type GuardrailConfig = z.infer<typeof guardrailConfig>

/** Decide whether a tool may be called given a guardrail config. */
export function isToolAllowed(config: GuardrailConfig, toolName: string): boolean {
  if (config.blockedTools.includes(toolName)) return false
  if (config.allowedTools.length > 0 && !config.allowedTools.includes(toolName)) return false
  return true
}
