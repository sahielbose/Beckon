import { signOutAction } from "@/server/actions/auth"
import { requireUser } from "@/server/current"
import { Button, Wordmark } from "@beckon/ui"
import Link from "next/link"

export default async function AppHomePage() {
  const user = await requireUser()

  return (
    <main className="mx-auto max-w-content space-y-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <Wordmark />
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Your workspace</h1>
        <p className="text-sm text-ink-muted">Signed in as {user.email}.</p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/app/settings/keys"
          className="rounded-md border border-line bg-bg px-4 py-2 text-sm font-medium text-ink transition-colors duration-micro ease-standard hover:bg-bg-subtle"
        >
          Manage API keys
        </Link>
        <Link
          href="/app/settings"
          className="rounded-md border border-line bg-bg px-4 py-2 text-sm font-medium text-ink transition-colors duration-micro ease-standard hover:bg-bg-subtle"
        >
          Settings
        </Link>
      </div>
    </main>
  )
}
