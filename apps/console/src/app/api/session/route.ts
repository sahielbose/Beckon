import { auth } from "@/server/auth"
import { json, preflight } from "@/server/cors"
import { getAgentForOrg } from "@/server/queries"
import { validateEmbed } from "@/server/runtime"
import { ensureOrgForUser } from "@/server/tenancy"
import { conversations, db } from "@beckon/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS(req: Request) {
  return preflight(req)
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin")
  const token = req.headers.get("x-beckon-token")
  const body = (await req.json().catch(() => ({}))) as {
    agentId?: string
    externalUserId?: string | null
  }

  let agentId: string

  if (token) {
    // Embed path: validate the public token and origin.
    const result = await validateEmbed(token, origin)
    if ("error" in result) return json({ error: result.error }, 401, origin)
    agentId = result.agentId
  } else {
    // Operator path (the in console playground): an authed session whose org owns
    // the agent.
    const session = await auth()
    const requested = String(body.agentId ?? "")
    if (!session?.user?.id || !requested) {
      return json({ error: "Not authorized." }, 401, origin)
    }
    const orgId = await ensureOrgForUser(session.user.id)
    const agent = await getAgentForOrg(orgId, requested)
    if (!agent) return json({ error: "Not authorized." }, 401, origin)
    agentId = requested
  }

  const [conversation] = await db
    .insert(conversations)
    .values({ agentId, externalUserId: body?.externalUserId ?? null, origin })
    .returning()

  return json({ sessionId: conversation.id, agentId }, 200, origin)
}
