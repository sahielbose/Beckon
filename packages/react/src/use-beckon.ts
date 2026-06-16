import { BeckonClient, type BeckonConfig, type ConfirmRequest } from "@beckon/client"
import { useCallback, useRef, useState } from "react"

export interface TimelineItem {
  id: string
  kind: "user" | "agent" | "status"
  text: string
  error?: boolean
}

export interface PendingConfirm {
  req: ConfirmRequest
  resolve: (ok: boolean) => void
}

function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
}

export function useBeckon(config: BeckonConfig) {
  const clientRef = useRef<BeckonClient | null>(null)
  if (!clientRef.current) clientRef.current = new BeckonClient(config)

  const [items, setItems] = useState<TimelineItem[]>([])
  const [busy, setBusy] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)

  const append = useCallback((item: TimelineItem) => setItems((prev) => [...prev, item]), [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return
      const client = clientRef.current
      if (!client) return

      append({ id: uid(), kind: "user", text: trimmed })
      const agentId = uid()
      append({ id: agentId, kind: "agent", text: "" })
      setBusy(true)

      await client.send(trimmed, {
        onEvent: (event) => {
          if (event.type === "token") {
            setItems((prev) =>
              prev.map((item) =>
                item.id === agentId ? { ...item, text: item.text + event.text } : item,
              ),
            )
          } else if (event.type === "tool_call") {
            append({ id: uid(), kind: "status", text: `Calling ${event.name}` })
          } else if (event.type === "tool_result") {
            append({
              id: uid(),
              kind: "status",
              text:
                event.status === "success" ? `${event.name} ran` : `${event.name} ${event.status}`,
              error: event.status === "error",
            })
          } else if (event.type === "action_request") {
            append({ id: uid(), kind: "status", text: `Running ${event.name}` })
          } else if (event.type === "citation") {
            append({ id: uid(), kind: "status", text: `Source: ${event.sourceName}` })
          }
        },
        confirm: (req) => new Promise<boolean>((resolve) => setPendingConfirm({ req, resolve })),
        onDone: () => setBusy(false),
        onError: (message) => {
          append({ id: uid(), kind: "status", text: message, error: true })
          setBusy(false)
        },
      })
    },
    [busy, append],
  )

  const resolveConfirm = useCallback((ok: boolean) => {
    setPendingConfirm((current) => {
      current?.resolve(ok)
      return null
    })
  }, [])

  return { items, busy, pendingConfirm, send, resolveConfirm }
}
