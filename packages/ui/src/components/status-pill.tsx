import { cn } from "../lib/cn"

export type StatusValue = "pending" | "processing" | "ready" | "error"

const STATUS: Record<StatusValue, { label: string; dot: string; text: string }> = {
  pending: { label: "Pending", dot: "bg-ink-faint", text: "text-ink-muted" },
  processing: { label: "Processing", dot: "bg-ink-muted animate-pulse", text: "text-ink-muted" },
  ready: { label: "Ready", dot: "bg-success", text: "text-success" },
  error: { label: "Error", dot: "bg-danger", text: "text-danger" },
}

export function StatusPill({
  status,
  label,
  className,
}: {
  status: StatusValue
  label?: string
  className?: string
}) {
  const s = STATUS[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-line bg-bg px-2 py-0.5 text-xs font-medium",
        s.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />
      {label ?? s.label}
    </span>
  )
}
