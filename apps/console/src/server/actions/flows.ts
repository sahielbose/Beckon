"use server"

import { requireOrgId } from "@/server/current"
import { assertAgentInOrg } from "@/server/guard"
import { db, flows as flowsTable } from "@beckon/db"
import type { FlowStep } from "@beckon/shared"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

function flowsPath(agentId: string) {
  return `/app/agents/${agentId}/flows`
}

export async function createFlowAction(input: {
  agentId: string
  name: string
  phrases: string[]
  steps: FlowStep[]
}): Promise<{ error?: string }> {
  const orgId = await requireOrgId()
  await assertAgentInOrg(input.agentId, orgId)

  if (!input.name.trim()) return { error: "Name your flow." }
  if (input.steps.length === 0) return { error: "Add at least one step." }
  if (input.phrases.length === 0) return { error: "Add at least one trigger phrase." }

  await db.insert(flowsTable).values({
    agentId: input.agentId,
    name: input.name.trim(),
    trigger: { phrases: input.phrases },
    steps: input.steps,
    enabled: true,
  })
  revalidatePath(flowsPath(input.agentId))
  return {}
}

export async function deleteFlowAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const flowId = String(formData.get("flowId") ?? "")
  await db.delete(flowsTable).where(and(eq(flowsTable.id, flowId), eq(flowsTable.agentId, agentId)))
  revalidatePath(flowsPath(agentId))
}

export async function toggleFlowAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const flowId = String(formData.get("flowId") ?? "")
  const enabled = formData.get("enabled") === "true"
  await db
    .update(flowsTable)
    .set({ enabled })
    .where(and(eq(flowsTable.id, flowId), eq(flowsTable.agentId, agentId)))
  revalidatePath(flowsPath(agentId))
}
