import { getCurrentUser, requireOrgId } from "@/server/current"
import { listAgents } from "@/server/queries"
import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
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
      <Sidebar
        agents={agents.map((a) => ({ id: a.id, name: a.name }))}
        activeAgentId={activeAgentId}
      />

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
