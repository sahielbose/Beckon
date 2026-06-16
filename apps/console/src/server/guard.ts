import { agents, db } from "@beckon/db"
import { and, eq } from "drizzle-orm"

/** Confirm an agent belongs to an org, or throw. The basis of tenant isolation. */
export async function assertAgentInOrg(agentId: string, orgId: string) {
  const row = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.orgId, orgId)))
    .limit(1)
  if (!row[0]) throw new Error("Agent not found in this workspace.")
}
