import { type GuardrailConfig, isToolAllowed } from "@beckon/shared"
import type { ClientActionRequest } from "@beckon/shared"
import type { ProviderTool, RuntimeTool } from "./types"

/** Tools the agent may use this turn: guardrail allowed and within the active flow. */
export function availableTools(
  tools: RuntimeTool[],
  guardrails: GuardrailConfig,
  flowAllowed?: string[] | null,
): RuntimeTool[] {
  return tools.filter((tool) => {
    if (!tool || !isToolAllowed(guardrails, tool.name)) return false
    if (flowAllowed && flowAllowed.length > 0 && !flowAllowed.includes(tool.name)) return false
    return true
  })
}

export function toProviderTools(tools: RuntimeTool[]): ProviderTool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }))
}

/** A plain language summary of what a tool call will do, for the confirm card. */
export function summarizeCall(tool: RuntimeTool, args: Record<string, unknown>): string {
  const detail = Object.entries(args)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(", ")
  const base = tool.description?.trim() || `Run ${tool.name}`
  return detail ? `${base} (${detail})` : base
}

/** Map a client tool or action call into the concrete action the widget runs. */
export function toActionRequest(
  tool: RuntimeTool,
  args: Record<string, unknown>,
): ClientActionRequest {
  if (tool.kind === "client") {
    return { actionType: "custom", params: args }
  }
  const actionType = tool.actionType ?? "custom"
  if (actionType === "navigate") {
    return { actionType: "navigate", url: String(args.url ?? args.to ?? "") }
  }
  if (actionType === "click") {
    return { actionType: "click", target: String(args.target ?? args.selector ?? "") }
  }
  if (actionType === "fill") {
    return {
      actionType: "fill",
      target: String(args.target ?? args.selector ?? ""),
      value: String(args.value ?? ""),
    }
  }
  return { actionType: "custom", params: args }
}
