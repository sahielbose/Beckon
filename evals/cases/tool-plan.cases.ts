import { makeTool, runTurnCollect } from "../support/agent"
import { check, defineCases } from "../types"

export const cases = defineCases("tool-plan", [
  {
    id: "tool-plan/selects-search-with-query",
    description: "A search request selects the search tool and builds a query argument",
    run: async () => {
      const tools = [
        makeTool({
          name: "searchClients",
          description: "Search clients by name",
          parameters: { type: "object", properties: { query: { type: "string" } } },
        }),
        makeTool({ name: "listInvoices", description: "List invoices" }),
      ]
      const { events } = await runTurnCollect({ userMessage: "Search clients for Acme", tools })
      const call = events.find((e) => e.type === "tool_call")
      if (!call || call.type !== "tool_call") return { pass: false, detail: "no tool_call emitted" }
      if (call.name !== "searchClients") return { pass: false, detail: `chose ${call.name}` }
      const query = String(call.args.query ?? "").toLowerCase()
      return check(query.includes("acme"), `query was ${JSON.stringify(call.args)}`)
    },
  },
  {
    id: "tool-plan/picks-the-matching-tool",
    description: "An invoice request selects the invoice tool, not the search tool",
    run: async () => {
      const tools = [
        makeTool({ name: "searchClients", description: "Search clients by name" }),
        makeTool({ name: "listInvoices", description: "List invoices for this account" }),
      ]
      const { events } = await runTurnCollect({ userMessage: "List my invoices", tools })
      const call = events.find((e) => e.type === "tool_call")
      if (!call || call.type !== "tool_call") return { pass: false, detail: "no tool_call emitted" }
      return check(call.name === "listInvoices", `chose ${call.name}`)
    },
  },
  {
    id: "tool-plan/no-tool-when-nothing-matches",
    description: "A general greeting does not force a tool call",
    run: async () => {
      const tools = [makeTool({ name: "searchClients", description: "Search clients by name" })]
      const { events } = await runTurnCollect({ userMessage: "Hello there", tools })
      const call = events.find((e) => e.type === "tool_call")
      return check(!call, "a tool was called for a greeting")
    },
  },
])
