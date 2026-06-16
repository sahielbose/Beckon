import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: replaced by the real Guardrails panel in Section 11.
export default function GuardrailsPage() {
  return (
    <SectionShell
      title="Guardrails"
      description="Choose which tools the agent may use and require a confirm step before any write."
    >
      <EmptyState
        title="Set your guardrails"
        description="Allow or block tools and keep confirm on write on. Enforcement is wired up next."
      />
    </SectionShell>
  )
}
