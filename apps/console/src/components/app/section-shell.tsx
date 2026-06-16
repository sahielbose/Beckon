import type { ReactNode } from "react"

/** Standard padded container and header for an agent section page. */
export function SectionShell({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-content space-y-6 px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{title}</h1>
          {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
