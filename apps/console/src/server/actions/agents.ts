"use server"

import { requireOrgId } from "@/server/current"
import { agents, db, guardrails } from "@beckon/db"
import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { z } from "zod"

export type AgentFormState = { error?: string }

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "agent"
  )
}

/** Create an agent with default guardrails, then open its playground. */
export async function createAgentAction(
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const orgId = await requireOrgId()
  const name = String(formData.get("name") ?? "").trim()
  if (!z.string().min(1).max(80).safeParse(name).success) {
    return { error: "Enter a name for your agent." }
  }

  // Ensure a unique slug within the org.
  const base = slugify(name)
  let slug = base
  for (let i = 2; i < 1000; i++) {
    const existing = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.orgId, orgId), eq(agents.slug, slug)))
      .limit(1)
    if (!existing[0]) break
    slug = `${base}-${i}`
  }

  const [agent] = await db.insert(agents).values({ orgId, name, slug }).returning()
  await db.insert(guardrails).values({ agentId: agent.id, confirmOnWrite: true })

  redirect(`/app/agents/${agent.id}/playground`)
}
