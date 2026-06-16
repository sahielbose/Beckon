"use client"

import { signOutAction } from "@/server/actions/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beckon/ui"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Crumb = { label: string; href?: string }

function label(seg: string) {
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}

function buildCrumbs(pathname: string, agentName: string | null): Crumb[] {
  const parts = pathname.split("/").filter(Boolean) // app, ...
  if (parts[1] === "agents" && parts[2]) {
    const crumbs: Crumb[] = [
      { label: "Agents", href: "/app" },
      { label: agentName ?? "Agent", href: `/app/agents/${parts[2]}/playground` },
    ]
    if (parts[3]) crumbs.push({ label: label(parts[3]) })
    return crumbs
  }
  if (parts[1] === "settings") {
    const crumbs: Crumb[] = [{ label: "Settings", href: "/app/settings" }]
    if (parts[2]) crumbs.push({ label: label(parts[2]) })
    return crumbs
  }
  return [{ label: "Agents" }]
}

export function TopBar({
  userName,
  userEmail,
  agentName,
}: {
  userName: string | null
  userEmail: string
  agentName: string | null
}) {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname, agentName)
  const initial = (userName ?? userEmail ?? "?").charAt(0).toUpperCase()

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
            ) : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-ink-muted transition-colors duration-micro ease-standard hover:text-ink"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-ink">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-bg-subtle text-sm font-medium text-ink transition-colors duration-micro ease-standard hover:bg-bg"
          >
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{userName ?? userEmail}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/app/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOutAction} className="w-full">
              <button type="submit" className="w-full text-left">
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
