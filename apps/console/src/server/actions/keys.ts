"use server"

import { requireOrgId } from "@/server/current"
import { agents, allowedOrigins, apiKeys, db } from "@beckon/db"
import { generateKey, hashKey, normalizeOrigin } from "@beckon/shared"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type RevealResult = { token?: string; prefix?: string; error?: string }
export type ActionResult = { error?: string; ok?: boolean }

/** Confirm an agent belongs to the caller's org, or throw. Tenant isolation. */
async function assertAgentInOrg(agentId: string, orgId: string) {
  const row = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.orgId, orgId)))
    .limit(1)
  if (!row[0]) throw new Error("Agent not found in this workspace.")
}

/** Create a secret server key. The full token is returned once and never stored. */
export async function createSecretKeyAction(
  _prev: RevealResult,
  _formData: FormData,
): Promise<RevealResult> {
  const orgId = await requireOrgId()
  const { token, prefix } = generateKey("secret")
  const keyHash = await hashKey(token)
  await db.insert(apiKeys).values({ orgId, type: "secret", keyHash, keyPrefix: prefix })
  revalidatePath("/app/settings/keys")
  return { token, prefix }
}

/** Create a public embed token scoped to a single agent. Returned once. */
export async function createEmbedTokenAction(agentId: string): Promise<RevealResult> {
  const orgId = await requireOrgId()
  await assertAgentInOrg(agentId, orgId)
  const { token, prefix } = generateKey("embed")
  const keyHash = await hashKey(token)
  await db
    .insert(apiKeys)
    .values({ orgId, agentId, type: "embed_public", keyHash, keyPrefix: prefix })
  revalidatePath(`/app/agents/${agentId}/install`)
  return { token, prefix }
}

/** Revoke a key. Scoped to the caller's org so other orgs' keys are untouchable. */
export async function revokeKeyAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const keyId = String(formData.get("keyId") ?? "")
  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.orgId, orgId)))
  revalidatePath("/app/settings/keys")
}

/** Add an allowed origin for an agent's embed. */
export async function addOriginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const orgId = await requireOrgId()
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  const origin = normalizeOrigin(String(formData.get("origin") ?? ""))
  if (!origin) {
    return { error: "Enter a full origin, for example https://app.example.com." }
  }
  await db.insert(allowedOrigins).values({ agentId, origin }).onConflictDoNothing()
  revalidatePath(`/app/agents/${agentId}/install`)
  return { ok: true }
}

/** Remove an allowed origin. */
export async function removeOriginAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const originId = String(formData.get("originId") ?? "")
  const agentId = String(formData.get("agentId") ?? "")
  await assertAgentInOrg(agentId, orgId)
  await db.delete(allowedOrigins).where(eq(allowedOrigins.id, originId))
  revalidatePath(`/app/agents/${agentId}/install`)
}
