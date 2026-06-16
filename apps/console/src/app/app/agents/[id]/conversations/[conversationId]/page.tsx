import { SectionShell } from "@/components/app/section-shell"
import { Transcript } from "@/components/app/transcript"
import { getConversation } from "@/server/analytics"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string; conversationId: string }>
}) {
  const { id, conversationId } = await params
  const detail = await getConversation(conversationId, id)
  if (!detail) notFound()

  return (
    <SectionShell
      title="Conversation"
      description={`Started ${new Date(detail.conversation.startedAt).toLocaleString()}`}
      action={
        <Link
          href={`/app/agents/${id}/conversations`}
          className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Back to conversations
        </Link>
      }
    >
      <Transcript
        messages={detail.messages}
        toolCalls={detail.toolCalls}
        actionEvents={detail.actionEvents}
      />
    </SectionShell>
  )
}
