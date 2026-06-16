import type { FlowStep, FlowTrigger } from "@beckon/shared"

export interface FlowInput {
  name: string
  trigger: FlowTrigger
  steps: FlowStep[]
}

export interface ActiveFlow {
  name: string
  /** Union of the tools allowed across the flow's steps. Empty means no narrowing. */
  allowedTools: string[]
  /** Step guidance injected into the system prompt to steer the agent. */
  guidance: string
}

/**
 * Detect whether a message triggers a flow, by matching any of the flow's trigger
 * phrases. Returns the tools the flow allows and the step guidance. Single active
 * flow for v1; multi step state across turns is a v1.1 extension.
 */
export function detectFlow(message: string, flows: FlowInput[]): ActiveFlow | null {
  const lower = message.toLowerCase()
  for (const flow of flows) {
    const phrases = flow.trigger?.phrases ?? []
    const matched = phrases.some((p) => p.trim().length > 0 && lower.includes(p.toLowerCase()))
    if (!matched) continue

    const allowedTools = Array.from(new Set(flow.steps.flatMap((step) => step.allowedTools ?? [])))
    const guidance = flow.steps
      .map((step, i) => `Step ${i + 1} (${step.name}): ${step.instruction}`)
      .join("\n")
    return { name: flow.name, allowedTools, guidance }
  }
  return null
}
