"use server"

import { hashPassword } from "@/lib/password"
import { sendEmail } from "@/server/email/mailer"
import { passwordResetEmail } from "@/server/email/templates"
import { db, users, verificationTokens } from "@beckon/db"
import { hashKey, randomString } from "@beckon/shared"
import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { z } from "zod"

export type ResetRequestState = { message?: string; error?: string }
export type ResetState = { error?: string }

const RESET_TTL_MS = 60 * 60 * 1000

function resetIdentifier(email: string) {
  return `pwreset:${email}`
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

const emailSchema = z.object({ email: z.string().email() })

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) return { error: "Enter a valid email." }

  const email = parsed.data.email.toLowerCase().trim()
  const user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0]

  // Only act when the account exists, but always return the same message so the
  // endpoint never reveals whether an email is registered.
  if (user) {
    const identifier = resetIdentifier(email)
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
    const token = randomString(40)
    const tokenHash = await hashKey(token)
    await db.insert(verificationTokens).values({
      identifier,
      token: tokenHash,
      expires: new Date(Date.now() + RESET_TTL_MS),
    })
    const url = `${appUrl()}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    const message = passwordResetEmail(url)
    message.to = email
    await sendEmail(message)
  }

  return { message: "If an account exists for that email, a reset link is on its way." }
}

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8),
})

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
  })
  if (!parsed.success) return { error: "Enter a new password of at least 8 characters." }

  const email = parsed.data.email.toLowerCase().trim()
  const identifier = resetIdentifier(email)
  const tokenHash = await hashKey(parsed.data.token)

  const row = (
    await db
      .select()
      .from(verificationTokens)
      .where(
        and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, tokenHash)),
      )
      .limit(1)
  )[0]

  if (!row || row.expires < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." }
  }

  const user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0]
  if (!user) {
    return { error: "This reset link is invalid or has expired. Request a new one." }
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(parsed.data.password) })
    .where(eq(users.id, user.id))
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))

  redirect("/login?reset=1")
}
