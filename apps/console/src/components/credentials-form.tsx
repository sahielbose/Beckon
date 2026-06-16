"use client"

import type { AuthFormState } from "@/server/actions/auth"
import { Button, Input, Label } from "@beckon/ui"
import { useActionState } from "react"

export function CredentialsForm({
  action,
  submitLabel,
  withName = false,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>
  submitLabel: string
  withName?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-4">
      {withName && (
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Your name" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={withName ? "new-password" : "current-password"}
        />
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
