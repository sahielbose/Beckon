"use server"

import { requireOrgId } from "@/server/current"
import { ingestSource } from "@/server/rag/ingest"
import { agents, db, knowledgeSources } from "@beckon/db"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type KnowledgeState = { error?: string }

async function assertAgentInOrg(agentId: string, orgId: string) {
  const row = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.orgId, orgId)))
    .limit(1)
  if (!row[0]) throw new Error("Agent not found in this workspace.")
}

function knowledgePath(agentId: string) {
  return `/app/agents/${agentId}/knowledge`
}

export async function addUrlSourceAction(
  _prev: KnowledgeState,
  formData: FormData,
): Promise<KnowledgeState> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)

  const raw = String(formData.get("url") ?? "").trim()
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { error: "Enter a full URL, including https://." }
  }

  const [source] = await db
    .insert(knowledgeSources)
    .values({
      agentId,
      type: "url",
      name: `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`,
      sourceUri: url.toString(),
      status: "pending",
    })
    .returning()

  await ingestSource(source.id)
  revalidatePath(knowledgePath(agentId))
  return {}
}

export async function addFileSourceAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    revalidatePath(knowledgePath(agentId))
    return
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const [source] = await db
    .insert(knowledgeSources)
    .values({ agentId, type: "file", name: file.name, status: "pending", sizeBytes: file.size })
    .returning()

  await ingestSource(source.id, buffer)
  revalidatePath(knowledgePath(agentId))
}

export async function removeSourceAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const sourceId = String(formData.get("sourceId") ?? "")
  await db
    .delete(knowledgeSources)
    .where(and(eq(knowledgeSources.id, sourceId), eq(knowledgeSources.agentId, agentId)))
  revalidatePath(knowledgePath(agentId))
}

export async function reindexSourceAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const sourceId = String(formData.get("sourceId") ?? "")
  await ingestSource(sourceId)
  revalidatePath(knowledgePath(agentId))
}
