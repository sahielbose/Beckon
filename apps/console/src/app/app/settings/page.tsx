import { signOutAction } from "@/server/actions/auth"
import { requireUser } from "@/server/current"
import { Button } from "@beckon/ui"

export default async function AccountSettingsPage() {
  const user = await requireUser()

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="text-sm text-ink-muted">Your profile and session.</p>
      </div>

      <dl className="space-y-4">
        <div className="space-y-0.5">
          <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">Name</dt>
          <dd className="text-sm text-ink">{user.name ?? "Not set"}</dd>
        </div>
        <div className="space-y-0.5">
          <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">Email</dt>
          <dd className="text-sm text-ink">{user.email}</dd>
        </div>
      </dl>

      <form action={signOutAction}>
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </section>
  )
}
