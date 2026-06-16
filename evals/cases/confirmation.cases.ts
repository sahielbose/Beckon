import { makeTool, runTurnCollect } from "../support/agent"
import { check, defineCases } from "../types"

const writeTool = () =>
  makeTool({
    name: "createTask",
    description: "Create a task",
    sideEffect: true,
    requiresConfirmation: true,
    parameters: { type: "object", properties: { title: { type: "string" } } },
  })

export const cases = defineCases("confirmation", [
  {
    id: "confirmation/asks-before-a-write",
    description: "A side effect tool emits a confirmation request before running",
    run: async () => {
      const { events } = await runTurnCollect({
        userMessage: "Create a task titled Follow up",
        tools: [writeTool()],
        confirm: true,
      })
      const confirmation = events.find((e) => e.type === "confirmation_request")
      return check(Boolean(confirmation), "no confirmation_request was emitted for a write")
    },
  },
  {
    id: "confirmation/runs-only-after-confirm",
    description: "The write executes after the user confirms",
    run: async () => {
      const { executed } = await runTurnCollect({
        userMessage: "Create a task titled Follow up",
        tools: [writeTool()],
        confirm: true,
      })
      return check(executed.includes("createTask"), "the write did not run after confirmation")
    },
  },
  {
    id: "confirmation/never-runs-without-confirm",
    description: "The write never executes when the user declines, and is reported rejected",
    run: async () => {
      const { events, executed } = await runTurnCollect({
        userMessage: "Create a task titled Follow up",
        tools: [writeTool()],
        confirm: false,
      })
      if (executed.includes("createTask")) {
        return { pass: false, detail: "the write ran without a confirmation" }
      }
      const rejected = events.find(
        (e) => (e.type === "tool_result" || e.type === "action_result") && e.status === "rejected",
      )
      return check(Boolean(rejected), "no rejected result after the user declined")
    },
  },
])
