import { json, preflight } from "@/server/cors"
import { globalPendingRegistry } from "@/server/runtime"
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

  if (input.type === "confirmation") {
    globalPendingRegistry.settle(key, { kind: "confirmation", confirmed: input.confirmed })
  } else if (input.type === "action_result") {
    globalPendingRegistry.settle(key, {
      kind: "result",
      status: input.status === "ok" ? "ok" : "error",
      result: input.result,
      error: input.error,
    })
  } else {
    globalPendingRegistry.settle(key, {
      kind: "result",
      status: input.status === "success" ? "ok" : "error",
      result: input.result,
      error: input.error,
    })
  }

  return json({ ok: true }, 200, origin)
}
