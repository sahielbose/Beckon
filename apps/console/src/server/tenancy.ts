import { db, memberships, organizations } from "@beckon/db"
import { and, eq } from "drizzle-orm"

/**
 * Ensure a user belongs to an organization. Creates one with an owner membership
 * the first time, and returns the user's primary org id. Used by both the sign up
 * path and the OAuth sign in path so every signed in user lands in their own org.
 */
export async function ensureOrgForUser(userId: string, name = "My workspace"): Promise<string> {
  const existing = await db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .limit(1)
  if (existing[0]) return existing[0].orgId

  const [org] = await db.insert(organizations).values({ name, ownerId: userId }).returning()
  await db.insert(memberships).values({ userId, orgId: org.id, role: "owner" })
  return org.id
}

/** The user's primary org, or null if they have none yet. */
export async function getPrimaryOrgId(userId: string): Promise<string | null> {
  const row = await db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .limit(1)
  return row[0]?.orgId ?? null
}

/** Whether a user is a member of an org. The basis of tenant isolation. */
export async function isMember(userId: string, orgId: string): Promise<boolean> {
  const row = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.orgId, orgId)))
    .limit(1)
  return row.length > 0
}
