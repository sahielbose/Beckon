"use server"

import { requireOrgId } from "@/server/current"
import { assertAgentInOrg } from "@/server/guard"
import { db, gatewayConfigs, toolSpecs as toolSpecsTable, tools as toolsTable } from "@beckon/db"
import { encryptSecret, parseOpenApi } from "@beckon/gateway"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type ImportState = { error?: string; ok?: boolean }

function toolsPath(agentId: string) {
  return `/app/agents/${agentId}/tools`
}

/** Import an OpenAPI spec: parse it, generate tools, and set up the gateway. */
export async function importOpenApiAction(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)

  const specText = String(formData.get("spec") ?? "").trim()
  if (!specText) return { error: "Paste an OpenAPI spec to import." }

  let parsed: ReturnType<typeof parseOpenApi>
  try {
    parsed = parseOpenApi(specText)
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not parse the spec." }
  }
  if (parsed.operations.length === 0) {
    return { error: "No operations were found in this spec." }
  }

  // Replace any previous OpenAPI import for this agent.
  const oldSpecs = await db
    .select({ id: toolSpecsTable.id })
    .from(toolSpecsTable)
    .where(and(eq(toolSpecsTable.agentId, agentId), eq(toolSpecsTable.type, "openapi")))
  for (const old of oldSpecs) {
    await db.delete(toolsTable).where(eq(toolsTable.toolSpecId, old.id))
    await db.delete(toolSpecsTable).where(eq(toolSpecsTable.id, old.id))
  }

  const [spec] = await db
    .insert(toolSpecsTable)
    .values({
      agentId,
      type: "openapi",
      name: parsed.title,
      rawSpec: { baseUrl: parsed.baseUrl, operationCount: parsed.operations.length },
      serverUrl: parsed.baseUrl,
    })
    .returning()

  await db.insert(toolsTable).values(
    parsed.operations.map((op) => ({
      agentId,
      toolSpecId: spec.id,
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

  // Ensure a gateway config exists with the spec's base url.
  const existing = (
    await db.select().from(gatewayConfigs).where(eq(gatewayConfigs.agentId, agentId)).limit(1)
  )[0]
  if (existing) {
    if (!existing.baseUrl && parsed.baseUrl) {
      await db
        .update(gatewayConfigs)
        .set({ baseUrl: parsed.baseUrl })
        .where(eq(gatewayConfigs.id, existing.id))
    }
  } else {
    await db.insert(gatewayConfigs).values({ agentId, baseUrl: parsed.baseUrl, authType: "none" })
  }

  revalidatePath(toolsPath(agentId))
  return { ok: true }
}

export async function toggleToolAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const toolId = String(formData.get("toolId") ?? "")
  const enabled = formData.get("enabled") === "true"
  await db
    .update(toolsTable)
    .set({ enabled })
    .where(and(eq(toolsTable.id, toolId), eq(toolsTable.agentId, agentId)))
  revalidatePath(toolsPath(agentId))
}

export async function toggleToolConfirmAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const toolId = String(formData.get("toolId") ?? "")
  const requiresConfirmation = formData.get("requiresConfirmation") === "true"
  await db
    .update(toolsTable)
    .set({ requiresConfirmation })
    .where(and(eq(toolsTable.id, toolId), eq(toolsTable.agentId, agentId)))
  revalidatePath(toolsPath(agentId))
}

export async function updateGatewayConfigAction(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)

  const baseUrl = String(formData.get("baseUrl") ?? "").trim()
  const authType = String(formData.get("authType") ?? "none") as "header" | "bearer" | "none"
  const authHeaderName = String(formData.get("authHeaderName") ?? "").trim() || null
  const authSecret = String(formData.get("authSecret") ?? "")
  const sharedSecret = String(formData.get("sharedSecret") ?? "")
  const rateLimitPerMin = Number(formData.get("rateLimitPerMin") ?? 60) || 60

  const patch: Record<string, unknown> = {
    baseUrl,
    authType,
    authHeaderName,
    rateLimitPerMin,
  }
  // Only overwrite secrets when a new value was entered.
  if (authSecret) patch.authSecretEncrypted = encryptSecret(authSecret)
  if (sharedSecret) patch.sharedSecretEncrypted = encryptSecret(sharedSecret)

  const existing = (
    await db.select().from(gatewayConfigs).where(eq(gatewayConfigs.agentId, agentId)).limit(1)
  )[0]
  if (existing) {
    await db.update(gatewayConfigs).set(patch).where(eq(gatewayConfigs.id, existing.id))
  } else {
    await db
      .insert(gatewayConfigs)
      .values({ agentId, baseUrl, authType, authHeaderName, rateLimitPerMin })
  }

  revalidatePath(toolsPath(agentId))
  return { ok: true }
}
