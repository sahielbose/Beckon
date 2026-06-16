"use server"

import { requireOrgId, requireUser } from "@/server/current"
import { sendEmail } from "@/server/email/mailer"
import { invitationEmail } from "@/server/email/templates"
import { db, invitations, memberships, organizations, users } from "@beckon/db"
import { hashKey, randomString } from "@beckon/shared"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

export type TeamState = { message?: string; error?: string }

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
})

export async function inviteMemberAction(_prev: TeamState, formData: FormData): Promise<TeamState> {
  const user = await requireUser()
  const orgId = await requireOrgId()

  const me = (
    await db
      .select({ role: memberships.role })
      .from(memberships)
      .where(and(eq(memberships.userId, user.id), eq(memberships.orgId, orgId)))
      .limit(1)
  )[0]
  if (!me || me.role === "member") {
    return { error: "Only owners and admins can invite people." }
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  })
  if (!parsed.success) return { error: "Enter a valid email and choose a role." }
  const email = parsed.data.email.toLowerCase().trim()

  const existingUser = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0]
  if (existingUser) {
    const member = (
      await db
        .select({ id: memberships.id })
        .from(memberships)
        .where(and(eq(memberships.userId, existingUser.id), eq(memberships.orgId, orgId)))
        .limit(1)
    )[0]
    if (member) return { error: "That person is already on your team." }
  }

  const token = randomString(40)
  const tokenHash = await hashKey(token)
  await db.insert(invitations).values({
    orgId,
    email,
    role: parsed.data.role,
    tokenHash,
    invitedBy: user.id,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  })

  const org = (await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1))[0]
  const message = invitationEmail(
    org?.name ?? "the workspace",
    `${appUrl()}/accept-invite?token=${token}`,
  )
  message.to = email
  await sendEmail(message)

  revalidatePath("/app/settings/team")
  return { message: `Invite sent to ${email}.` }
}

export async function revokeInvitationAction(formData: FormData): Promise<void> {
  const orgId = await requireOrgId()
  const id = String(formData.get("invitationId") ?? "")
  await db.delete(invitations).where(and(eq(invitations.id, id), eq(invitations.orgId, orgId)))
  revalidatePath("/app/settings/team")
}

export async function acceptInvitationAction(formData: FormData): Promise<void> {
  const user = await requireUser()
  const token = String(formData.get("token") ?? "")
  const tokenHash = await hashKey(token)

  const inv = (
    await db.select().from(invitations).where(eq(invitations.tokenHash, tokenHash)).limit(1)
  )[0]
  if (!inv || inv.acceptedAt || inv.expiresAt < new Date()) {
    redirect("/accept-invite?status=invalid")
  }
  if ((user.email ?? "").toLowerCase() !== inv.email.toLowerCase()) {
    redirect("/accept-invite?status=wrong-account")
  }

  const existing = (
    await db
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.userId, user.id), eq(memberships.orgId, inv.orgId)))
      .limit(1)
  )[0]
  if (!existing) {
    await db.insert(memberships).values({ userId: user.id, orgId: inv.orgId, role: inv.role })
  }
  await db.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, inv.id))

  redirect("/app")
}
