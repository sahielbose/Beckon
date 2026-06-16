import { KnowledgeManager, type SourceRow } from "@/components/app/knowledge-manager"
import { SectionShell } from "@/components/app/section-shell"
import { listKnowledgeSources } from "@/server/queries"
import type { StatusValue } from "@beckon/ui"

export default async function KnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sources = await listKnowledgeSources(id)

  const rows: SourceRow[] = sources.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    status: s.status as StatusValue,
    error: s.error,
    created: new Date(s.createdAt).toLocaleDateString(),
  }))

  return (
    <SectionShell
      title="Knowledge"
      description="Add files and URLs the agent can answer from, with citations to the exact source."
    >
      <KnowledgeManager agentId={id} sources={rows} />
    </SectionShell>
  )
}
