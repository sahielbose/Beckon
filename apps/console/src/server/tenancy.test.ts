import { agents, db, pgClient, users } from "@beckon/db"
import { eq } from "drizzle-orm"
import { afterAll, describe, expect, it } from "vitest"
import { ensureOrgForUser, isMember } from "./tenancy"

// DB backed. Runs only when BECKON_DB_TESTS=1 so the default suite stays offline.
const run = process.env.BECKON_DB_TESTS === "1"

describe.skipIf(!run)("tenant isolation", () => {
  it("scopes agent queries to the owning org", async () => {
    const stamp = Date.now()
    const [userA] = await db
      .insert(users)
      .values({ email: `a-${stamp}@test.dev` })
      .returning()
    const [userB] = await db
      .insert(users)
      .values({ email: `b-${stamp}@test.dev` })
      .returning()

    const orgA = await ensureOrgForUser(userA.id, "Org A")
    const orgB = await ensureOrgForUser(userB.id, "Org B")
    expect(orgA).not.toBe(orgB)

    const [agentA] = await db
      .insert(agents)
      .values({ orgId: orgA, name: "A", slug: `a-${stamp}` })
      .returning()

    // An org B scoped query must never see org A's agent.
    const visibleToB = await db.select().from(agents).where(eq(agents.orgId, orgB))
    expect(visibleToB.find((a) => a.id === agentA.id)).toBeUndefined()

    expect(await isMember(userA.id, orgA)).toBe(true)
    expect(await isMember(userA.id, orgB)).toBe(false)
  })
})

afterAll(async () => {
  if (run) await pgClient.end()
})
