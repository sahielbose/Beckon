"use client"

import { inviteMemberAction } from "@/server/actions/team"
import { Button, Input, Label } from "@beckon/ui"
import { useActionState } from "react"

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteMemberAction, {})

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="teammate@company.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <select
            id="invite-role"
            name="role"
            defaultValue="member"
            className="h-9 w-full rounded-md border border-line bg-bg px-3 text-sm text-ink transition-colors duration-micro ease-standard focus-visible:border-line-strong focus-visible:outline-none"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          Send invite
        </Button>
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-success">{state.message}</p> : null}
    </form>
  )
}
