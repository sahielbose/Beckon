"use client"

import { Building2, Check } from "lucide-react"

// A small presentational mini CRM card that the hero demo drives. It renders the
// current client list and gently highlights a row that was just added. It owns no
// timers or state of its own; the hero demo passes everything as props so the two
// stay in lockstep. The card reserves a fixed number of row slots so the layout
// never shifts as a new client appears.

export type MockClient = {
  id: string
  name: string
  plan: string
}

type MockAppPanelProps = {
  clients: MockClient[]
  // Id of the row that was just added, so it can carry a calm highlight. When null,
  // every row sits at rest.
  highlightedId: string | null
  // Total row slots to reserve, so the panel keeps a stable height across the loop.
  slots?: number
}

export function MockAppPanel({ clients, highlightedId, slots = 4 }: MockAppPanelProps) {
  const emptySlots = Math.max(0, slots - clients.length)

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg shadow-rest">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Clients
          </span>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-ink-faint">{clients.length}</span>
      </div>

      <ul className="divide-y divide-line">
        {clients.map((client) => {
          const isNew = client.id === highlightedId
          return (
            <li
              key={client.id}
              className={[
                "flex items-center justify-between px-4 py-2.5 transition-colors duration-entrance ease-standard motion-reduce:transition-none",
                isNew ? "bg-success-subtle" : "bg-bg",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-bg-subtle text-[11px] font-medium text-ink-muted"
                  aria-hidden="true"
                >
                  {client.name.slice(0, 1)}
                </span>
                <span className="text-sm font-medium text-ink">{client.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-faint">{client.plan}</span>
                {isNew ? <Check className="h-3.5 w-3.5 text-success" aria-label="Added" /> : null}
              </div>
            </li>
          )
        })}

        {/* Reserve the remaining slots so the panel height never jumps. */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows are static and unkeyed by nature.
            key={`slot-${i}`}
            className="flex items-center px-4 py-2.5"
            aria-hidden="true"
          >
            <span className="h-6 w-6 shrink-0 rounded-md border border-dashed border-line" />
          </li>
        ))}
      </ul>
    </div>
  )
}
