"use server"

import { requireOrgId } from "@/server/current"
import { runIngestion } from "@/server/queue/queue"
import { deleteObject, isStorageConfigured, putObject, sourceObjectKey } from "@/server/storage/s3"
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

  await runIngestion(source.id)
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

  if (isStorageConfigured()) {
    // Persist the original so re-indexing never needs a re-upload.
    const key = sourceObjectKey(agentId, source.id, file.name)
    try {
      await putObject(key, buffer, file.type || "application/octet-stream")
      await db
        .update(knowledgeSources)
        .set({ storageKey: key })
        .where(eq(knowledgeSources.id, source.id))
      await runIngestion(source.id)
    } catch (error) {
      await db
        .update(knowledgeSources)
        .set({
          status: "error",
          error: error instanceof Error ? error.message : "Could not store the file.",
        })
        .where(eq(knowledgeSources.id, source.id))
    }
  } else {
    // No storage configured: ingest once from the buffer in hand.
    await runIngestion(source.id, { buffer })
  }

  revalidatePath(knowledgePath(agentId))
}

export async function removeSourceAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const sourceId = String(formData.get("sourceId") ?? "")
  const existing = (
    await db
      .select({ storageKey: knowledgeSources.storageKey })
      .from(knowledgeSources)
      .where(and(eq(knowledgeSources.id, sourceId), eq(knowledgeSources.agentId, agentId)))
      .limit(1)
  )[0]
  await db
    .delete(knowledgeSources)
    .where(and(eq(knowledgeSources.id, sourceId), eq(knowledgeSources.agentId, agentId)))
  // Best effort cleanup of the stored original.
  if (existing?.storageKey) {
    await deleteObject(existing.storageKey).catch(() => {})
  }
  revalidatePath(knowledgePath(agentId))
}

export async function reindexSourceAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const sourceId = String(formData.get("sourceId") ?? "")
  // Works for URLs (re-fetch) and files (re-read from storage), no re-upload.
  await db
    .update(knowledgeSources)
    .set({ status: "pending", error: null })
    .where(and(eq(knowledgeSources.id, sourceId), eq(knowledgeSources.agentId, agentId)))
  await runIngestion(sourceId)
  revalidatePath(knowledgePath(agentId))
}
