"use client"

import { requestPasswordResetAction } from "@/server/actions/password"
import { Button, Input, Label } from "@beckon/ui"
import Link from "next/link"
import { useActionState } from "react"

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, {})

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-ink-muted">
          Enter your email and we will send a link to set a new password.
        </p>
      </div>

      {state.message ? (
        <p className="rounded-md border border-line bg-bg-subtle px-3 py-2 text-sm text-ink">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
          <Button type="submit" disabled={pending} className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="text-sm text-ink-muted">
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
