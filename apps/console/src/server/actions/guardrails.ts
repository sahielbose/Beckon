"use server"

import { requireOrgId } from "@/server/current"
import { assertAgentInOrg } from "@/server/guard"
import { db, guardrails as guardrailsTable } from "@beckon/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateGuardrailsAction(input: {
  agentId: string
  blockedTools: string[]
  confirmOnWrite: boolean
}): Promise<void> {
  const orgId = await requireOrgId()
  await assertAgentInOrg(input.agentId, orgId)

  const existing = (
    await db
      .select()
      .from(guardrailsTable)
      .where(eq(guardrailsTable.agentId, input.agentId))
      .limit(1)
  )[0]

  const values = {
    blockedTools: input.blockedTools,
    confirmOnWrite: input.confirmOnWrite,
    allowedTools: [] as string[],
  }

  if (existing) {
    await db.update(guardrailsTable).set(values).where(eq(guardrailsTable.id, existing.id))
  } else {
    await db.insert(guardrailsTable).values({ agentId: input.agentId, ...values })
  }
  revalidatePath(`/app/agents/${input.agentId}/guardrails`)
}
