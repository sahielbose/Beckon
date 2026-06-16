import { SectionShell } from "@/components/app/section-shell"
import { getAnalyticsSummary } from "@/server/analytics"
import { EmptyState } from "@beckon/ui"
import { BarChart3 } from "lucide-react"

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-bg p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  )
}

function IntentBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="truncate text-ink">{label}</span>
        <span className="shrink-0 text-ink-faint">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-bg-subtle">
        <div className="h-2 rounded-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const summary = await getAnalyticsSummary(id)

  if (summary.totalConversations === 0) {
    return (
      <SectionShell
        title="Analytics"
        description="See top intents, tool success rates, and where things break."
      >
        <EmptyState
          icon={<BarChart3 className="h-5 w-5 text-ink-faint" />}
          title="No usage yet"
          description="Analytics fill in as people use the agent."
        />
      </SectionShell>
    )
  }

  const maxIntent = Math.max(...summary.topIntents.map((i) => i.count), 1)

  return (
    <SectionShell
      title="Analytics"
      description="See top intents, tool success rates, and where things break."
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Conversations" value={summary.totalConversations} />
        <Stat label="Messages" value={summary.totalMessages} />
        <Stat label="Tools used" value={summary.toolStats.length} />
      </div>

      {summary.topIntents.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Top intents</h2>
          <div className="max-w-2xl space-y-3">
            {summary.topIntents.map((intent) => (
              <IntentBar
                key={intent.content}
                label={intent.content.slice(0, 80)}
                value={intent.count}
                max={maxIntent}
              />
            ))}
          </div>
        </section>
      ) : null}

      {summary.toolStats.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Tool success</h2>
          <div className="max-w-2xl space-y-4">
            {summary.toolStats.map((tool) => {
              const rate = tool.total > 0 ? Math.round((tool.success / tool.total) * 100) : 0
              return (
                <div key={tool.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-ink">{tool.name}</span>
                    <span className="text-ink-faint">
                      {rate}% of {tool.total}
                    </span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-bg-subtle">
                    <div
                      className="h-2 bg-ink"
                      style={{ width: `${(tool.success / tool.total) * 100}%` }}
                    />
                    <div
                      className="h-2 bg-danger"
                      style={{ width: `${(tool.error / tool.total) * 100}%` }}
                    />
                    <div
                      className="h-2 bg-line-strong"
                      style={{ width: `${(tool.rejected / tool.total) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-ink-faint">
            Black is success, red is error, grey is declined.
          </p>
        </section>
      ) : null}
    </SectionShell>
  )
}
