import {
  agents,
  allowedOrigins,
  apiKeys,
  db,
  knowledgeSources,
  memberships,
  organizations,
  users,
} from "@beckon/db"
import { and, desc, eq } from "drizzle-orm"

export async function listKnowledgeSources(agentId: string) {
  return db
    .select()
    .from(knowledgeSources)
    .where(eq(knowledgeSources.agentId, agentId))
    .orderBy(desc(knowledgeSources.createdAt))
}

export async function listAgents(orgId: string) {
  return db.select().from(agents).where(eq(agents.orgId, orgId)).orderBy(desc(agents.createdAt))
}

export async function getAgentForOrg(orgId: string, agentId: string) {
  return (
    await db
      .select()
      .from(agents)
      .where(and(eq(agents.orgId, orgId), eq(agents.id, agentId)))
      .limit(1)
  )[0]
}

export async function listSecretKeys(orgId: string) {
  return db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.orgId, orgId), eq(apiKeys.type, "secret")))
    .orderBy(desc(apiKeys.createdAt))
}

export async function listEmbedTokens(agentId: string) {
  return db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.agentId, agentId), eq(apiKeys.type, "embed_public")))
    .orderBy(desc(apiKeys.createdAt))
}

export async function listOrigins(agentId: string) {
  return db.select().from(allowedOrigins).where(eq(allowedOrigins.agentId, agentId))
}

export async function listMembers(orgId: string) {
  return db
    .select({
      id: memberships.id,
      role: memberships.role,
      name: users.name,
      email: users.email,
      userId: users.id,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.orgId, orgId))
}

export async function getOrg(orgId: string) {
  return (await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1))[0]
}
