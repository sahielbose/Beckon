import { ResetPasswordForm } from "@/components/reset-password-form"
import Link from "next/link"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>
}) {
  const { token, email } = await searchParams

  if (!token || !email) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Reset link is incomplete</h1>
        <p className="text-sm text-ink-muted">
          This link is missing information. Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <p className="text-sm text-ink-muted">Choose a new password for {email}.</p>
      </div>
      <ResetPasswordForm token={token} email={email} />
    </div>
  )
}
