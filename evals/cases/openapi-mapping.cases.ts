import { parseOpenApi, validateArgs } from "@beckon/gateway"
import { SAMPLE_SPEC } from "../support/spec"
import { check, defineCases } from "../types"

export const cases = defineCases("openapi-mapping", [
  {
    id: "openapi-mapping/generates-all-operations",
    description: "Each path and method becomes one tool with the right method",
    run: () => {
      const { operations, baseUrl } = parseOpenApi(
        SAMPLE_SPEC as unknown as Record<string, unknown>,
      )
      const byId = new Map(operations.map((o) => [o.operationId, o]))
      if (baseUrl !== "https://api.example.com")
        return { pass: false, detail: `baseUrl ${baseUrl}` }
      const expected = [
        ["listClients", "GET"],
        ["createClient", "POST"],
        ["getClient", "GET"],
        ["deleteClient", "DELETE"],
      ]
      for (const [id, method] of expected) {
        const op = byId.get(id)
        if (!op) return { pass: false, detail: `missing ${id}` }
        if (op.method !== method) return { pass: false, detail: `${id} method ${op.method}` }
      }
      return { pass: true }
    },
  },
  {
    id: "openapi-mapping/detects-writes",
    description: "Write operations are marked as side effects, reads are not",
    run: () => {
      const { operations } = parseOpenApi(SAMPLE_SPEC as unknown as Record<string, unknown>)
      const byId = new Map(operations.map((o) => [o.operationId, o]))
      const create = byId.get("createClient")
      const del = byId.get("deleteClient")
      const list = byId.get("listClients")
      return check(
        create?.sideEffect === true && del?.sideEffect === true && list?.sideEffect === false,
        "write detection was wrong",
      )
    },
  },
  {
    id: "openapi-mapping/builds-valid-args",
    description: "Required body fields are required, and validation rejects a missing one",
    run: () => {
      const { operations } = parseOpenApi(SAMPLE_SPEC as unknown as Record<string, unknown>)
      const create = operations.find((o) => o.operationId === "createClient")
      if (!create) return { pass: false, detail: "no createClient" }
      if (!create.bodyProps.includes("name")) return { pass: false, detail: "name not in body" }
      const good = validateArgs(create.parametersSchema, { name: "Acme" })
      const bad = validateArgs(create.parametersSchema, {})
      return check(good.ok && !bad.ok, `good=${good.ok} bad=${bad.ok}`)
    },
  },
])
