import { cn } from "../lib/cn"

/** The Beckon wordmark, set in the display face. Text based, our own mark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-block h-3.5 w-3.5 rounded-[3px] border-2 border-ink"
      />
      Beckon
    </span>
  )
}
