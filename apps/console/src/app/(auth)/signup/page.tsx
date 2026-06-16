import { CredentialsForm } from "@/components/credentials-form"
import { signInWithGithub, signUpAction } from "@/server/actions/auth"
import { githubEnabled } from "@/server/auth"
import { Button } from "@beckon/ui"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-ink-muted">
          Start a workspace. You can add your team and agents next.
        </p>
      </div>

      <CredentialsForm action={signUpAction} submitLabel="Create account" withName />

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

      <p className="text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
