import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: replaced by the real Knowledge tab in Section 7.
export default function KnowledgePage() {
  return (
    <SectionShell
      title="Knowledge"
      description="Add files and URLs the agent can answer from, with citations to the exact source."
    >
      <EmptyState
        title="Add your first knowledge source"
        description="Upload a document or add a URL. Ingestion and grounded answers are wired up next."
      />
    </SectionShell>
  )
}
