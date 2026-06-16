import { redirect } from "next/navigation"
import { auth } from "./auth"
import { ensureOrgForUser } from "./tenancy"

/** The current session user, or null. */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/** Require a signed in user, or redirect to login. */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user?.id) redirect("/login")
  return user
}

/**
 * Require a signed in user and return their org id. This is the anchor of tenant
 * isolation: every app query filters by the org id returned here. ensureOrgForUser
 * is idempotent so this is safe to call on every request.
 */
export async function requireOrgId(): Promise<string> {
  const user = await requireUser()
  return ensureOrgForUser(user.id)
}
