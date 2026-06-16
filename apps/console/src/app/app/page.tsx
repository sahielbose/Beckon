import { AppShell } from "@/components/app/app-shell"
import { CreateAgentDialog } from "@/components/app/create-agent-dialog"
import { requireOrgId } from "@/server/current"
import { listAgents } from "@/server/queries"
import { Badge, Button, EmptyState } from "@beckon/ui"
import { Bot } from "lucide-react"
import Link from "next/link"

export default async function AgentsOverviewPage() {
  const orgId = await requireOrgId()
  const agents = await listAgents(orgId)

  return (
    <AppShell>
      <div className="mx-auto max-w-content space-y-8 px-6 py-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Agents</h1>
            <p className="text-sm text-ink-muted">
              An agent is a copilot you configure and embed in your app.
            </p>
          </div>
          <CreateAgentDialog trigger={<Button>Create agent</Button>} />
        </div>

        {agents.length === 0 ? (
          <EmptyState
            icon={<Bot className="h-5 w-5 text-ink-faint" />}
            title="Create your first agent"
            description="Set up a copilot, add knowledge and tools, then embed it in your app."
            action={<CreateAgentDialog trigger={<Button>Create agent</Button>} />}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={`/app/agents/${agent.id}/playground`}
                  className="block h-full rounded-lg border border-line bg-bg p-5 shadow-rest transition-colors duration-micro ease-standard hover:bg-bg-subtle"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ink">{agent.name}</span>
                    <Badge variant={agent.status === "live" ? "success" : "muted"}>
                      {agent.status === "live" ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-2 font-mono text-xs text-ink-faint">{agent.id}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
