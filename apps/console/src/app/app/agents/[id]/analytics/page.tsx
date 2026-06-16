import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: replaced by the real Analytics in Section 12.
export default function AnalyticsPage() {
  return (
    <SectionShell
      title="Analytics"
      description="See top intents, tool success rates, and where things break."
    >
      <EmptyState
        title="No usage yet"
        description="Analytics fill in as people use the agent. Rollups and charts are wired up next."
      />
    </SectionShell>
  )
}
