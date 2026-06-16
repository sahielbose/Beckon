import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: replaced by the real Conversations transcripts in Section 12.
export default function ConversationsPage() {
  return (
    <SectionShell
      title="Conversations"
      description="Replay every turn: the messages, tool calls, actions, and confirmations."
    >
      <EmptyState
        title="No conversations yet"
        description="Once people use the agent, their conversations show up here. Logging is wired up next."
      />
    </SectionShell>
  )
}
