"use client"

import { cn } from "@beckon/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AGENT_NAV } from "./nav-items"

export function AgentNav({ agentId }: { agentId: string }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-0.5">
      {AGENT_NAV.map((item) => {
        const href = `/app/agents/${agentId}/${item.seg}`
        const active = pathname.startsWith(href)
        return (
          <Link
            key={item.seg}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              // A left rail marks the active route. The rail is always present but
              // transparent until active, so width never shifts on selection.
              "relative block rounded-md py-1.5 pr-2 pl-3 text-sm transition-colors duration-micro ease-standard",
              "before:absolute before:inset-y-1.5 before:left-0.5 before:w-0.5 before:rounded-full before:transition-colors before:duration-micro before:ease-standard",
              active
                ? "bg-bg-subtle font-medium text-ink before:bg-ink"
                : "text-ink-muted before:bg-transparent hover:bg-bg-subtle hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
