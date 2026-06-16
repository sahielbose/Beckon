import { acceptInvitationAction } from "@/server/actions/team"
import { getCurrentUser } from "@/server/current"
import { db, invitations, organizations } from "@beckon/db"
import { hashKey } from "@beckon/shared"
import { Button, Wordmark } from "@beckon/ui"
import { eq } from "drizzle-orm"
import Link from "next/link"

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/">
        <Wordmark />
      </Link>
      <div className="w-full max-w-sm space-y-4 text-center">{children}</div>
    </main>
  )
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>
}) {
  const { token, status } = await searchParams

  if (status === "wrong-account") {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">Wrong account</h1>
        <p className="text-sm text-ink-muted">
          This invite was sent to a different email. Sign in as that account and open the link
          again.
        </p>
      </Shell>
    )
  }

  if (!token) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">This invite is not valid</h1>
        <p className="text-sm text-ink-muted">
          The link is missing its token. Ask for a new invite.
        </p>
      </Shell>
    )
  }

  const tokenHash = await hashKey(token)
  const invite = (
    await db.select().from(invitations).where(eq(invitations.tokenHash, tokenHash)).limit(1)
  )[0]

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date() || status === "invalid") {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">This invite is no longer valid</h1>
        <p className="text-sm text-ink-muted">
          It may have expired or already been used. Ask for a new invite.
        </p>
      </Shell>
    )
  }

  const org = (
    await db.select().from(organizations).where(eq(organizations.id, invite.orgId)).limit(1)
  )[0]
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">Join {org?.name ?? "the workspace"}</h1>
        <p className="text-sm text-ink-muted">
          Sign in or create an account with {invite.email}, then open this link again to accept.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-bg-subtle"
          >
            Create account
          </Link>
        </div>
      </Shell>
    )
  }

  if ((user.email ?? "").toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">This invite is for {invite.email}</h1>
        <p className="text-sm text-ink-muted">
          You are signed in as {user.email}. Sign in as {invite.email} to accept.
        </p>
      </Shell>
    )
  }

  return (
    <Shell>
      <h1 className="text-xl font-semibold">Join {org?.name ?? "the workspace"}</h1>
      <p className="text-sm text-ink-muted">
        You were invited as {invite.role}. Accept to join the workspace.
      </p>
      <form action={acceptInvitationAction} className="flex justify-center">
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Accept invite</Button>
      </form>
    </Shell>
  )
}
