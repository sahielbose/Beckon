import { Playground } from "@/components/app/playground"
import { SectionShell } from "@/components/app/section-shell"

export default async function PlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <SectionShell
      title="Playground"
      description="Chat with this agent and watch its tool calls and actions before you ship."
    >
      <Playground agentId={id} />
    </SectionShell>
  )
}
