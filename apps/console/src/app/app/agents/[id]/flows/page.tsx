import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: replaced by the real Flows builder in Section 11.
export default function FlowsPage() {
  return (
    <SectionShell
      title="Flows"
      description="Define multi step workflows the agent follows, with the right tools at each step."
    >
      <EmptyState
        title="Create your first flow"
        description="Set a trigger and ordered steps. The flow builder and runtime steering are wired up next."
      />
    </SectionShell>
  )
}
