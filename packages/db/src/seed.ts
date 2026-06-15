import { eq } from "drizzle-orm"
import { db, pgClient } from "./client"
import { agents, guardrails, memberships, organizations, users } from "./schema"

// Minimal idempotent seed for local development. Creates one operator, one
// organization, and one draft agent so the console has something to show.
// The richer demo CRM seed lives in apps/demo (Section 13).

async function main() {
  const email = "demo@beckon.dev"

  let user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0]
  if (!user) {
    user = (await db.insert(users).values({ name: "Demo operator", email }).returning())[0]
    console.log(`Created user ${user.id}`)
  }

  let org = (
    await db.select().from(organizations).where(eq(organizations.ownerId, user.id)).limit(1)
  )[0]
  if (!org) {
    org = (
      await db
        .insert(organizations)
        .values({ name: "Demo workspace", ownerId: user.id })
        .returning()
    )[0]
    console.log(`Created organization ${org.id}`)
  }

  const membership = (
    await db.select().from(memberships).where(eq(memberships.userId, user.id)).limit(1)
  )[0]
  if (!membership) {
    await db.insert(memberships).values({ userId: user.id, orgId: org.id, role: "owner" })
    console.log("Created owner membership")
  }

  let agent = (await db.select().from(agents).where(eq(agents.orgId, org.id)).limit(1))[0]
  if (!agent) {
    agent = (
      await db
        .insert(agents)
        .values({
          orgId: org.id,
          name: "Demo copilot",
          slug: "demo-copilot",
          systemPrompt: "You help users get things done inside the app.",
          status: "draft",
        })
        .returning()
    )[0]
    console.log(`Created agent ${agent.id}`)

    await db.insert(guardrails).values({ agentId: agent.id, confirmOnWrite: true })
    console.log("Created default guardrails")
  }

  console.log("Seed complete.")
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pgClient.end()
  })
