import { json, preflight } from "@/server/cors"
import { validateEmbed } from "@/server/runtime"
import { conversations, db } from "@beckon/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS(req: Request) {
  return preflight(req)
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin")
  const token = req.headers.get("x-beckon-token")

  const result = await validateEmbed(token, origin)
  if ("error" in result) {
    return json({ error: result.error }, 401, origin)
  }

  const body = (await req.json().catch(() => ({}))) as { externalUserId?: string | null }
  const [conversation] = await db
    .insert(conversations)
    .values({
      agentId: result.agentId,
      externalUserId: body?.externalUserId ?? null,
      origin,
    })
    .returning()

  return json({ sessionId: conversation.id, agentId: result.agentId }, 200, origin)
}
