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
              "block rounded-md px-2 py-1.5 text-sm transition-colors duration-micro ease-standard",
              active
                ? "bg-bg-subtle font-medium text-ink"
                : "text-ink-muted hover:bg-bg-subtle hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
