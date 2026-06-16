import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: the interactive playground (the in console widget and turn inspector) is
// built in Section 10. This frame keeps the tab navigable until then.
export default function PlaygroundPage() {
  return (
    <SectionShell
      title="Playground"
      description="Chat with this agent and watch its tool calls and actions before you ship."
    >
      <EmptyState
        title="The playground opens here"
        description="Add knowledge and tools, then test the agent. The interactive playground is wired up next."
      />
    </SectionShell>
  )
}
