import { FlowBuilder, type FlowRow } from "@/components/app/flow-builder"
import { SectionShell } from "@/components/app/section-shell"
import { listFlows, listTools } from "@/server/queries"

export default async function FlowsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [flows, tools] = await Promise.all([listFlows(id), listTools(id)])

  const flowRows: FlowRow[] = flows.map((f) => ({
    id: f.id,
    name: f.name,
    phrases: f.trigger?.phrases ?? [],
    stepCount: f.steps.length,
    enabled: f.enabled,
  }))

  return (
    <SectionShell
      title="Flows"
      description="Define multi step workflows the agent follows, with the right tools at each step."
    >
      <FlowBuilder agentId={id} tools={tools.map((t) => t.name)} flows={flowRows} />
    </SectionShell>
  )
}
