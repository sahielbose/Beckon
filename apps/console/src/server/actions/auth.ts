"use server"

import { hashPassword } from "@/lib/password"
import { signIn, signOut } from "@/server/auth"
import { ensureOrgForUser } from "@/server/tenancy"
import { db, users } from "@beckon/db"
import { eq } from "drizzle-orm"
import { AuthError } from "next-auth"
import { z } from "zod"

export type AuthFormState = { error?: string }

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: "Enter a valid email and your password." }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      redirectTo: "/app",
    })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "That email or password did not match. Try again." }
    }
    // A redirect is expected on success; let it through.
    throw error
  }
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: "Enter a valid email and a password of at least 8 characters." }
  }

  const email = parsed.data.email.toLowerCase().trim()
  const name = String(formData.get("name") ?? "").trim() || null

  const existing = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0]
  if (existing) {
    return { error: "An account with that email already exists. Sign in instead." }
  }

  const [user] = await db
    .insert(users)
    .values({ email, name, passwordHash: hashPassword(parsed.data.password) })
    .returning()
  await ensureOrgForUser(user.id)

  try {
    await signIn("credentials", { email, password: parsed.data.password, redirectTo: "/app" })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created. Please sign in." }
    }
    throw error
  }
}

export async function signInWithGithub() {
  await signIn("github", { redirectTo: "/app" })
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" })
}
