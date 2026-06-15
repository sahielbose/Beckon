import { cn } from "../lib/cn"

export interface CommandLine {
  role: "user" | "agent" | "system"
  text: string
}

/**
 * The signature element: a monospace command surface on white with black ink and
 * a single blinking caret. Presentational shell reused by the hero and the widget.
 */
export function CommandSurface({
  lines = [],
  placeholder = "Ask Beckon to do something",
  className,
  caret = true,
}: {
  lines?: CommandLine[]
  placeholder?: string
  className?: string
  caret?: boolean
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border border-line bg-bg shadow-rest", className)}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Beckon
        </span>
      </div>
      <div className="space-y-2.5 p-4 font-mono text-sm leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={`${line.role}-${i}`}
            className={cn("flex gap-2", line.role === "user" ? "text-ink" : "text-ink-muted")}
          >
            <span className="select-none text-ink-faint">{line.role === "user" ? ">" : "·"}</span>
            <span className="whitespace-pre-wrap">{line.text}</span>
          </div>
        ))}
        <div className="flex gap-2 text-ink">
          <span className="select-none text-ink-faint">{">"}</span>
          <span className={cn("text-ink-faint", caret && "beckon-caret")}>{placeholder}</span>
        </div>
      </div>
    </div>
  )
}
