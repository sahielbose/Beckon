import { auth } from "@/server/auth"
import { corsHeaders, json } from "@/server/cors"
import { getAgentForOrg } from "@/server/queries"
import { buildRunContext, makeTurnLogger, validateEmbed } from "@/server/runtime"
import { ensureOrgForUser } from "@/server/tenancy"
import { runTurn } from "@beckon/agent-core"
import { conversations, db, messages as messagesTable } from "@beckon/db"
import { chatRequest } from "@beckon/shared"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) })
}

type Conversation = typeof conversations.$inferSelect

/** Authorize a chat request: a valid embed token, or an operator session whose org
 *  owns the agent (the in console playground). */
async function authorizeChat(
  conv: Conversation,
  token: string | null,
  origin: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (token) {
    const result = await validateEmbed(token, origin)
    if ("error" in result) return { ok: false, error: result.error }
    if (result.agentId !== conv.agentId) {
      return { ok: false, error: "This token does not match the session." }
    }
    return { ok: true }
  }

  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: "Not authorized." }
  const orgId = await ensureOrgForUser(session.user.id)
  const agent = await getAgentForOrg(orgId, conv.agentId)
  if (!agent) return { ok: false, error: "Not authorized." }
  return { ok: true }
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin")
  const token = req.headers.get("x-beckon-token")

  const parsed = chatRequest.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: "Invalid chat request." }, 400, origin)
  const { sessionId, message, clientTools, clientActions } = parsed.data

  const conv = (
    await db.select().from(conversations).where(eq(conversations.id, sessionId)).limit(1)
  )[0]
  if (!conv) return json({ error: "Unknown session." }, 404, origin)

  const allowed = await authorizeChat(conv, token, origin)
  if (!allowed.ok) return json({ error: allowed.error }, 401, origin)

  await db
    .insert(messagesTable)
    .values({ conversationId: sessionId, role: "user", content: message })

  const ctx = await buildRunContext({
    conversationId: sessionId,
    agentId: conv.agentId,
    externalUserId: conv.externalUserId,
    userMessage: message,
    clientTools,
    clientActions,
  })
  if (!ctx) return json({ error: "Agent not found." }, 404, origin)
  ctx.log = makeTurnLogger(sessionId)

  const encoder = new TextEncoder()
  let assistantText = ""

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of runTurn(ctx)) {
          if (event.type === "token") assistantText += event.text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Runtime error."
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`),
        )
      } finally {
        if (assistantText.trim()) {
          await db
            .insert(messagesTable)
            .values({ conversationId: sessionId, role: "assistant", content: assistantText })
        }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      ...corsHeaders(origin),
    },
  })
}
