// Wire the demo app to a Beckon agent: create the agent, import the demo's OpenAPI
// as tools, point the gateway at the demo, allow the demo origin, and mint an embed
// token. Run with the demo app running:
//   DATABASE_URL=... pnpm --filter @beckon/console exec tsx scripts/setup-demo.ts
//
// Prints the env vars to drop into apps/demo/.env.local.

import {
  agents,
  allowedOrigins,
  apiKeys,
  db,
  gatewayConfigs,
  guardrails,
  memberships,
  organizations,
  pgClient,
  toolSpecs,
  tools as toolsTable,
  users,
} from "@beckon/db"
import { parseOpenApi } from "@beckon/gateway"
import { generateKey, hashKey } from "@beckon/shared"
import { and, eq } from "drizzle-orm"

const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL ?? "http://localhost:3100"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

async function main() {
  const email = "demo@beckon.dev"
  let user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0]
  if (!user) {
    user = (await db.insert(users).values({ name: "Demo operator", email }).returning())[0]
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
    await db.insert(memberships).values({ userId: user.id, orgId: org.id, role: "owner" })
  }

  let agent = (
    await db
      .select()
      .from(agents)
      .where(and(eq(agents.orgId, org.id), eq(agents.slug, "crm-copilot")))
      .limit(1)
  )[0]
  if (!agent) {
    agent = (
      await db
        .insert(agents)
        .values({
          orgId: org.id,
          name: "CRM copilot",
          slug: "crm-copilot",
          systemPrompt: "You help users manage clients, deals, and tasks in the CRM.",
          status: "live",
        })
        .returning()
    )[0]
    await db.insert(guardrails).values({ agentId: agent.id, confirmOnWrite: true })
  }

  const response = await fetch(`${DEMO_URL}/api/openapi.json`)
  if (!response.ok) {
    throw new Error(`Could not fetch the demo spec at ${DEMO_URL}. Start the demo app first.`)
  }
  const parsed = parseOpenApi(await response.json())

  const oldSpecs = await db
    .select({ id: toolSpecs.id })
    .from(toolSpecs)
    .where(and(eq(toolSpecs.agentId, agent.id), eq(toolSpecs.type, "openapi")))
  for (const old of oldSpecs) {
    await db.delete(toolsTable).where(eq(toolsTable.toolSpecId, old.id))
    await db.delete(toolSpecs).where(eq(toolSpecs.id, old.id))
  }

  const [specRow] = await db
    .insert(toolSpecs)
    .values({ agentId: agent.id, type: "openapi", name: parsed.title, serverUrl: parsed.baseUrl })
    .returning()

  await db.insert(toolsTable).values(
    parsed.operations.map((op) => ({
      agentId: agent.id,
      toolSpecId: specRow.id,
      name: op.operationId,
      description: op.description,
      parametersSchema: op.parametersSchema,
      httpMethod: op.method as never,
      pathTemplate: op.path,
      routing: op as unknown as Record<string, unknown>,
      sideEffect: op.sideEffect,
      requiresConfirmation: op.sideEffect,
      enabled: true,
    })),
  )

  const existingGw = (
    await db.select().from(gatewayConfigs).where(eq(gatewayConfigs.agentId, agent.id)).limit(1)
  )[0]
  if (existingGw) {
    await db
      .update(gatewayConfigs)
      .set({ baseUrl: parsed.baseUrl })
      .where(eq(gatewayConfigs.id, existingGw.id))
  } else {
    await db
      .insert(gatewayConfigs)
      .values({ agentId: agent.id, baseUrl: parsed.baseUrl, authType: "none" })
  }

  await db
    .insert(allowedOrigins)
    .values({ agentId: agent.id, origin: DEMO_URL })
    .onConflictDoNothing()

  const { token, prefix } = generateKey("embed")
  await db.insert(apiKeys).values({
    orgId: org.id,
    agentId: agent.id,
    type: "embed_public",
    keyHash: await hashKey(token),
    keyPrefix: prefix,
  })

  console.log("\nDemo agent wired up. Put these in apps/demo/.env.local:\n")
  console.log(`NEXT_PUBLIC_BECKON_AGENT_ID=${agent.id}`)
  console.log(`NEXT_PUBLIC_BECKON_TOKEN=${token}`)
  console.log(`NEXT_PUBLIC_BECKON_API_URL=${APP_URL}`)
  console.log(`NEXT_PUBLIC_DEMO_URL=${DEMO_URL}\n`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pgClient.end()
  })
