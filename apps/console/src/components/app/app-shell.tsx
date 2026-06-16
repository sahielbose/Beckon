import { getCurrentUser, requireOrgId } from "@/server/current"
import { listAgents } from "@/server/queries"
import { Wordmark } from "@beckon/ui"
import { Settings } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { AgentNav } from "./agent-nav"
import { AgentSwitcher } from "./agent-switcher"
import { TopBar } from "./top-bar"

/**
 * The frame every app screen lives in: a left sidebar with the agent switcher and
 * per agent navigation, plus a top bar with breadcrumbs and the account menu.
 */
export async function AppShell({
  activeAgentId,
  children,
}: {
  activeAgentId?: string
  children: ReactNode
}) {
  const [user, orgId] = await Promise.all([getCurrentUser(), requireOrgId()])
  const agents = await listAgents(orgId)
  const activeAgent = activeAgentId ? agents.find((a) => a.id === activeAgentId) : undefined

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-bg">
        <div className="px-3 py-3">
          <Link href="/app" className="mb-3 inline-flex px-1" aria-label="Beckon home">
            <Wordmark />
          </Link>
          <AgentSwitcher
            agents={agents.map((a) => ({ id: a.id, name: a.name }))}
            activeAgentId={activeAgentId}
          />
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
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted transition-colors duration-micro ease-standard hover:bg-bg-subtle hover:text-ink"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          userName={user?.name ?? null}
          userEmail={user?.email ?? ""}
          agentName={activeAgent?.name ?? null}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
