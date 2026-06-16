import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: replaced by the real Tools tab (OpenAPI import) in Section 8.
export default function ToolsPage() {
  return (
    <SectionShell
      title="Tools"
      description="Import an OpenAPI spec so each operation becomes a callable tool. Writes are gated by default."
    >
      <EmptyState
        title="Import your first spec"
        description="Paste or upload an OpenAPI spec. The parser and the secure gateway are wired up next."
      />
    </SectionShell>
  )
}
