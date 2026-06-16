"use client"

import { createSecretKeyAction, revokeKeyAction } from "@/server/actions/keys"
import { Badge, Button, Card, CardContent, CopyButton, EmptyState, StatusPill } from "@beckon/ui"
import { KeyRound } from "lucide-react"
import { useActionState } from "react"

export type KeyRow = {
  id: string
  keyPrefix: string
  created: string
  revoked: boolean
}

export function KeysManager({ keys }: { keys: KeyRow[] }) {
  const [state, formAction, pending] = useActionState(createSecretKeyAction, {})

  return (
    <div className="space-y-6">
      {state.token ? (
        <Card className="border-line-strong">
          <CardContent className="space-y-3 pt-5">
            <p className="text-sm font-medium text-ink">
              Copy this secret key now. You will not be able to see it again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md border border-line bg-bg-subtle px-3 py-2 font-mono text-sm text-ink">
                {state.token}
              </code>
              <CopyButton value={state.token} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <form action={formAction}>
        <Button type="submit" disabled={pending}>
          Create secret key
        </Button>
      </form>

      {keys.length === 0 ? (
        <EmptyState
          icon={<KeyRound className="h-5 w-5 text-ink-faint" />}
          title="No secret keys yet"
          description="Create a secret key to call the management API from your server."
        />
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="space-y-0.5">
                <code className="font-mono text-sm text-ink">{key.keyPrefix}...</code>
                <p className="text-xs text-ink-faint">Created {key.created}</p>
              </div>
              {key.revoked ? (
                <Badge variant="muted">Revoked</Badge>
              ) : (
                <div className="flex items-center gap-3">
                  <StatusPill status="ready" label="Active" />
                  <form action={revokeKeyAction}>
                    <input type="hidden" name="keyId" value={key.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
