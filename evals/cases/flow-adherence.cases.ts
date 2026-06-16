import { detectFlow } from "@beckon/agent-core"
import { makeTool, runTurnCollect } from "../support/agent"
import { check, defineCases } from "../types"

const cancellationFlow = {
  name: "Cancellation",
  trigger: { phrases: ["cancel my plan", "cancel subscription"] },
  steps: [
    {
      name: "Offer retention",
      instruction: "Offer a discount before cancelling.",
      allowedTools: ["offerDiscount"],
    },
    {
      name: "Cancel",
      instruction: "Cancel only if they still want to.",
      allowedTools: ["offerDiscount", "cancelPlan"],
    },
  ],
}

export const cases = defineCases("flow-adherence", [
  {
    id: "flow-adherence/detects-trigger",
    description: "A matching phrase activates the flow and collects its tools",
    run: () => {
      const active = detectFlow("I want to cancel my plan", [cancellationFlow])
      if (!active) return { pass: false, detail: "flow not detected" }
      const hasBoth =
        active.allowedTools.includes("offerDiscount") && active.allowedTools.includes("cancelPlan")
      return check(hasBoth, `tools were ${JSON.stringify(active.allowedTools)}`)
    },
  },
  {
    id: "flow-adherence/no-trigger-no-flow",
    description: "An unrelated message does not activate the flow",
    run: () =>
      check(
        detectFlow("what are your hours", [cancellationFlow]) === null,
        "flow wrongly activated",
      ),
  },
  {
    id: "flow-adherence/narrows-tools-to-the-flow",
    description: "When a flow is active, a tool outside it is never used",
    run: async () => {
      const tools = [
        makeTool({ name: "offerDiscount", description: "Offer a discount" }),
        makeTool({ name: "deleteAccount", description: "Delete the account", sideEffect: true }),
      ]
      const { executed } = await runTurnCollect({
        userMessage: "Delete the account",
        tools,
        flowAllowedTools: ["offerDiscount"],
      })
      return check(!executed.includes("deleteAccount"), "a tool outside the flow ran")
    },
  },
])
