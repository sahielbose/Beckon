import { clientActionRequest } from "@beckon/shared"
import { makeTool, runTurnCollect } from "../support/agent"
import { check, defineCases } from "../types"

const navTool = () =>
  makeTool({
    name: "openClient",
    description: "Open a client record",
    kind: "action",
    actionType: "navigate",
    sideEffect: false,
    parameters: { type: "object", properties: { url: { type: "string" } } },
  })

const writeAction = () =>
  makeTool({
    name: "createClient",
    description: "Create a client record",
    kind: "action",
    actionType: "custom",
    sideEffect: true,
    requiresConfirmation: true,
    parameters: { type: "object", properties: { name: { type: "string" } } },
  })

export const cases = defineCases("client-actions", [
  {
    id: "client-actions/produces-valid-action-payload",
    description: "A UI action request matches the action schema",
    run: async () => {
      const { events } = await runTurnCollect({
        userMessage: "Open client record for Acme",
        tools: [navTool()],
      })
      const request = events.find((e) => e.type === "action_request")
      if (!request || request.type !== "action_request") {
        return { pass: false, detail: "no action_request emitted" }
      }
      const parsed = clientActionRequest.safeParse(request.action)
      return check(parsed.success, `invalid action payload: ${JSON.stringify(request.action)}`)
    },
  },
  {
    id: "client-actions/never-runs-an-unconfirmed-write",
    description: "A side effect action is never requested when the user declines",
    run: async () => {
      const { events } = await runTurnCollect({
        userMessage: "Create a client named Acme",
        tools: [writeAction()],
        confirm: false,
      })
      const ran = events.some((e) => e.type === "action_request")
      const confirmed = events.some((e) => e.type === "confirmation_request")
      return check(confirmed && !ran, `confirmed=${confirmed} ran=${ran}`)
    },
  },
  {
    id: "client-actions/runs-the-action-after-confirm",
    description: "A side effect action runs once the user confirms",
    run: async () => {
      const { events } = await runTurnCollect({
        userMessage: "Create a client named Acme",
        tools: [writeAction()],
        confirm: true,
      })
      return check(
        events.some((e) => e.type === "action_request"),
        "the action did not run after confirmation",
      )
    },
  },
])
