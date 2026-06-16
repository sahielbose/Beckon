"use client"

import { signOutAction } from "@/server/actions/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/95 py-3 pr-4 pl-16 backdrop-blur sm:pr-6 md:pl-6">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 truncate text-sm">
        {crumbs.map((crumb, i) => (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
            ) : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="rounded-sm text-ink-muted transition-colors duration-micro ease-standard hover:text-ink"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-ink">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg-subtle text-sm font-medium text-ink transition-colors duration-micro ease-standard hover:border-line-strong hover:bg-bg"
          >
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <div className="px-2 py-1.5">
            {userName ? <p className="truncate text-sm font-medium text-ink">{userName}</p> : null}
            <p className="truncate text-xs text-ink-muted">{userEmail}</p>
          </div>
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
