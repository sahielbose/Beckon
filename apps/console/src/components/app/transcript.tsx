import { Badge, StatusPill, type StatusValue } from "@beckon/ui"

type Message = { role: string; content: string; createdAt: Date }
type ToolCall = {
  name: string
  status: string
  args: unknown
  result: unknown
  error: string | null
  requiresConfirmation: boolean
  confirmedAt: Date | null
  createdAt: Date
}
type ActionEvent = {
  actionType: string
  status: string
  payload: unknown
  confirmedAt: Date | null
  createdAt: Date
}

type Item =
  | { at: number; key: string; kind: "message"; data: Message }
  | { at: number; key: string; kind: "tool"; data: ToolCall }
  | { at: number; key: string; kind: "action"; data: ActionEvent }

function toolStatusValue(status: string): StatusValue {
  if (status === "success") return "ready"
  if (status === "error") return "error"
  return "pending"
}

export function Transcript({
  messages,
  toolCalls,
  actionEvents,
}: {
  messages: Message[]
  toolCalls: ToolCall[]
  actionEvents: ActionEvent[]
}) {
  const items: Item[] = [
    ...messages.map((m, i) => ({
      at: m.createdAt.getTime(),
      key: `m${i}`,
      kind: "message" as const,
      data: m,
    })),
    ...toolCalls.map((t, i) => ({
      at: t.createdAt.getTime(),
      key: `t${i}`,
      kind: "tool" as const,
      data: t,
    })),
    ...actionEvents.map((a, i) => ({
      at: a.createdAt.getTime(),
      key: `a${i}`,
      kind: "action" as const,
      data: a,
    })),
  ].sort((a, b) => a.at - b.at)

  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">This conversation has no turns yet.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        if (item.kind === "message") {
          const isUser = item.data.role === "user"
          return (
            <div key={item.key} className="flex gap-2 text-sm">
              <span className="select-none font-mono text-ink-faint">{isUser ? ">" : "·"}</span>
              <span className={isUser ? "text-ink" : "text-ink-muted"}>{item.data.content}</span>
            </div>
          )
        }
        if (item.kind === "tool") {
          return (
            <div key={item.key} className="rounded-md border border-line bg-bg-subtle p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-ink">{item.data.name}</span>
                <div className="flex items-center gap-2">
                  {item.data.requiresConfirmation ? (
                    <Badge variant="muted">
                      {item.data.confirmedAt ? "confirmed" : "needs confirm"}
                    </Badge>
                  ) : null}
                  <StatusPill status={toolStatusValue(item.data.status)} label={item.data.status} />
                </div>
              </div>
              <pre className="mt-2 overflow-x-auto font-mono text-xs text-ink-muted">
                {JSON.stringify(item.data.args, null, 2)}
              </pre>
              {item.data.error ? (
                <p className="mt-1 text-xs text-danger">{item.data.error}</p>
              ) : null}
            </div>
          )
        }
        return (
          <div key={item.key} className="rounded-md border border-line bg-bg-subtle p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-ink">action: {item.data.actionType}</span>
              <StatusPill
                status={
                  item.data.status === "ok"
                    ? "ready"
                    : item.data.status === "error"
                      ? "error"
                      : "pending"
                }
                label={item.data.status}
              />
            </div>
            <pre className="mt-2 overflow-x-auto font-mono text-xs text-ink-muted">
              {JSON.stringify(item.data.payload, null, 2)}
            </pre>
          </div>
        )
      })}
    </div>
  )
}
