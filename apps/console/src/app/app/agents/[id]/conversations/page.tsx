import { SectionShell } from "@/components/app/section-shell"
import { listConversations } from "@/server/analytics"
import {
  Badge,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@beckon/ui"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function ConversationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conversations = await listConversations(id)

  return (
    <SectionShell
      title="Conversations"
      description="Replay every turn: the messages, tool calls, actions, and confirmations."
    >
      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-5 w-5 text-ink-faint" />}
          title="No conversations yet"
          description="Once people use the agent, their conversations show up here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Started</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((c) => (
              <TableRow key={c.id} className="group">
                <TableCell>
                  <Link
                    href={`/app/agents/${id}/conversations/${c.id}`}
                    className="font-medium text-ink underline-offset-4 hover:underline focus-visible:underline"
                  >
                    {new Date(c.startedAt).toLocaleString()}
                  </Link>
                </TableCell>
                <TableCell className="text-ink-muted">{c.externalUserId ?? "Anonymous"}</TableCell>
                <TableCell className="text-ink-muted">{c.origin ?? "Console"}</TableCell>
                <TableCell>
                  <Badge variant="muted">{c.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionShell>
  )
}
