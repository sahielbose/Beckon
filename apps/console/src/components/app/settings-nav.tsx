"use client"

import { cn } from "@beckon/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/app/settings", label: "Account" },
  { href: "/app/settings/team", label: "Team" },
  { href: "/app/settings/keys", label: "API keys" },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto text-sm md:flex-col md:gap-1 md:overflow-visible">
      <p className="hidden px-2 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint md:block">
        Settings
      </p>
      {NAV.map((item) => {
        // Account is the index route, so it must match exactly. The others match
        // their own prefix.
        const active =
          item.href === "/app/settings"
            ? pathname === "/app/settings"
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative block shrink-0 rounded-md py-1.5 pr-2 pl-3 transition-colors duration-micro ease-standard",
              "md:before:absolute md:before:inset-y-1.5 md:before:left-0.5 md:before:w-0.5 md:before:rounded-full md:before:transition-colors md:before:duration-micro md:before:ease-standard",
              active
                ? "bg-bg-subtle font-medium text-ink md:before:bg-ink"
                : "text-ink-muted hover:bg-bg-subtle hover:text-ink md:before:bg-transparent",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
