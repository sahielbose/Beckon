"use client"

import { Wordmark, cn } from "@beckon/ui"
import { Menu, Settings, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AgentNav } from "./agent-nav"
import { AgentSwitcher } from "./agent-switcher"

/**
 * The left navigation. On desktop it is a fixed rail. On small screens it
 * collapses behind a menu button and slides in as an overlay. The Settings link
 * shows a clear active state driven by the current route.
 */
export function Sidebar({
  agents,
  activeAgentId,
}: {
  agents: { id: string; name: string }[]
  activeAgentId?: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const settingsActive = pathname.startsWith("/app/settings")

  // Close the mobile drawer whenever the route changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: close on navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const nav = (
    <div className="flex h-full flex-col">
      <div className="px-3 py-3">
        <Link href="/app" className="mb-3 inline-flex px-1" aria-label="Beckon home">
          <Wordmark />
        </Link>
        <AgentSwitcher agents={agents} activeAgentId={activeAgentId} />
      </div>
      {activeAgentId ? (
        <div className="flex-1 overflow-y-auto px-3">
          <AgentNav agentId={activeAgentId} />
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <div className="border-t border-line p-3">
        <Link
          href="/app/settings"
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "relative flex items-center gap-2 rounded-md py-1.5 pr-2 pl-3 text-sm transition-colors duration-micro ease-standard",
            "before:absolute before:inset-y-1.5 before:left-0.5 before:w-0.5 before:rounded-full before:transition-colors before:duration-micro before:ease-standard",
            settingsActive
              ? "bg-bg-subtle font-medium text-ink before:bg-ink"
              : "text-ink-muted before:bg-transparent hover:bg-bg-subtle hover:text-ink",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" /> Settings
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button, pinned top left. Hidden once the rail is visible. */}
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-bg text-ink shadow-rest transition-colors duration-micro ease-standard hover:bg-bg-subtle md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop rail. Sticky and full height so it stays in view as content scrolls. */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-bg md:block">
        {nav}
      </aside>

      {/* Mobile overlay drawer. */}
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/20 motion-safe:animate-fade-in"
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-line bg-bg shadow-hover motion-safe:animate-slide-in-left">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors duration-micro ease-standard hover:bg-bg-subtle hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
            {nav}
          </div>
        </div>
      ) : null}
    </>
  )
}
