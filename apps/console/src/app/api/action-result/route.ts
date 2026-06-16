import { json, preflight } from "@/server/cors"
import { getPendingRegistry } from "@/server/runtime"
import { actionResultInput } from "@beckon/shared"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS(req: Request) {
  return preflight(req)
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin")
  const parsed = actionResultInput.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: "Invalid result." }, 400, origin)

  const input = parsed.data
  const key = `${input.sessionId}:${input.requestId}`
  const registry = getPendingRegistry()

  if (input.type === "confirmation") {
    await registry.settle(key, { kind: "confirmation", confirmed: input.confirmed })
  } else if (input.type === "action_result") {
    await registry.settle(key, {
      kind: "result",
      status: input.status === "ok" ? "ok" : "error",
      result: input.result,
      error: input.error,
    })
  } else {
    await registry.settle(key, {
      kind: "result",
      status: input.status === "success" ? "ok" : "error",
      result: input.result,
      error: input.error,
    })
  }

  return json({ ok: true }, 200, origin)
}
