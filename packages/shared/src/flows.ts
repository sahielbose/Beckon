import { z } from "zod"

// A flow is an operator defined, conditional, multi step workflow. The runtime
// detects a matching trigger and steers the agent through the steps, narrowing the
// tool set per step.

export const flowTrigger = z.object({
  // Phrases or intents that activate the flow.
  phrases: z.array(z.string()).default([]),
  intent: z.string().optional(),
})
export type FlowTrigger = z.infer<typeof flowTrigger>

export const flowStep = z.object({
  name: z.string(),
  instruction: z.string(),
  // Tool names allowed during this step. Empty means inherit the agent's tools.
  allowedTools: z.array(z.string()).default([]),
})
export type FlowStep = z.infer<typeof flowStep>

export const flowDefinition = z.object({
  trigger: flowTrigger,
  steps: z.array(flowStep).default([]),
})
export type FlowDefinition = z.infer<typeof flowDefinition>
