import { CredentialsForm } from "@/components/credentials-form"
import { signInAction, signInWithGithub } from "@/server/actions/auth"
import { githubEnabled } from "@/server/auth"
import { Button } from "@beckon/ui"
import Link from "next/link"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>
}) {
  const { reset } = await searchParams
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-ink-muted">Welcome back. Sign in to open your workspace.</p>
      </div>

      {reset ? (
        <p className="rounded-md border border-line bg-bg-subtle px-3 py-2 text-sm text-success">
          Your password is updated. Sign in with your new password.
        </p>
      ) : null}

      <CredentialsForm action={signInAction} submitLabel="Sign in" />

      {githubEnabled ? (
        <>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-xs uppercase tracking-wide text-ink-faint">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <form action={signInWithGithub}>
            <Button type="submit" variant="secondary" className="w-full">
              Continue with GitHub
            </Button>
          </form>
        </>
      ) : null}

      <div className="space-y-1 text-sm text-ink-muted">
        <p>
          <Link
            href="/forgot-password"
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </p>
        <p>
          New here?{" "}
          <Link href="/signup" className="font-medium text-ink underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
