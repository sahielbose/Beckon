import { type GuardrailToolRow, GuardrailsPanel } from "@/components/app/guardrails-panel"
import { SectionShell } from "@/components/app/section-shell"
import { getGuardrailsRow, listTools } from "@/server/queries"

export default async function GuardrailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tools, guardrails] = await Promise.all([listTools(id), getGuardrailsRow(id)])

  const toolRows: GuardrailToolRow[] = tools.map((t) => ({
    name: t.name,
    sideEffect: t.sideEffect,
  }))

  return (
    <SectionShell
      title="Guardrails"
      description="Choose which tools the agent may use and require a confirm step before any write."
    >
      <GuardrailsPanel
        agentId={id}
        tools={toolRows}
        blocked={guardrails?.blockedTools ?? []}
        confirmOnWrite={guardrails?.confirmOnWrite ?? true}
      />
    </SectionShell>
  )
}
