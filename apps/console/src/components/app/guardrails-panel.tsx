"use client"

import { updateGuardrailsAction } from "@/server/actions/guardrails"
import { Button, Card, CardContent, EmptyState, Switch } from "@beckon/ui"
import { ShieldCheck } from "lucide-react"
import { useState, useTransition } from "react"

export type GuardrailToolRow = { name: string; sideEffect: boolean }

export function GuardrailsPanel({
  agentId,
  tools,
  blocked,
  confirmOnWrite,
}: {
  agentId: string
  tools: GuardrailToolRow[]
  blocked: string[]
  confirmOnWrite: boolean
}) {
  const [blockedSet, setBlockedSet] = useState(new Set(blocked))
  const [confirm, setConfirm] = useState(confirmOnWrite)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)

  function toggleBlocked(name: string, on: boolean) {
    setBlockedSet((prev) => {
      const next = new Set(prev)
      if (on) next.add(name)
      else next.delete(name)
      return next
    })
    setSaved(false)
  }

  function save() {
    start(async () => {
      await updateGuardrailsAction({
        agentId,
        blockedTools: [...blockedSet],
        confirmOnWrite: confirm,
      })
      setSaved(true)
    })
  }

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-5">
          <div>
            <p className="font-medium text-ink">Confirm before any write</p>
            <p className="text-sm text-ink-muted">
              Anything that sends, posts, charges, or changes settings waits for a confirm step.
            </p>
          </div>
          <Switch
            checked={confirm}
            onCheckedChange={(v) => {
              setConfirm(v)
              setSaved(false)
            }}
            aria-label="Confirm before any write"
          />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tools</h2>
        {tools.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="h-5 w-5 text-ink-faint" />}
            title="No tools to guard yet"
            description="Import tools on the Tools tab, then block any the agent should never call."
          />
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {tools.map((tool) => (
              <li key={tool.name} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <span className="font-medium text-ink">{tool.name}</span>
                  {tool.sideEffect ? (
                    <span className="ml-2 font-mono text-xs text-ink-faint">write</span>
                  ) : null}
                </div>
                <span className="flex items-center gap-2 text-sm text-ink-muted">
                  Blocked
                  <Switch
                    checked={blockedSet.has(tool.name)}
                    onCheckedChange={(on) => toggleBlocked(tool.name, on)}
                    aria-label={`Block ${tool.name}`}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          Save guardrails
        </Button>
        {saved ? <span className="text-sm text-success">Saved.</span> : null}
      </div>
    </div>
  )
}
