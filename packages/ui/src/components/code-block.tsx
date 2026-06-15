import { cn } from "../lib/cn"
import { CopyButton } from "./copy-button"

export function CodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <pre className="overflow-x-auto rounded-md border border-line bg-bg-subtle p-4 font-mono text-sm text-ink">
        <code>{code}</code>
      </pre>
      <CopyButton value={code} className="absolute right-2 top-2" />
    </div>
  )
}
