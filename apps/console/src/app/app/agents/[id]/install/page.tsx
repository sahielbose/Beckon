import { SectionShell } from "@/components/app/section-shell"
import { EmptyState } from "@beckon/ui"

// STUB: replaced by the real Install tab (snippets, embed token, origins) in Section 10.
export default function InstallPage() {
  return (
    <SectionShell
      title="Install"
      description="Copy a snippet, create an embed token, and set your allowed origins."
    >
      <EmptyState
        title="Get your install snippet"
        description="The React snippet, the script tag, and the origin allowlist editor are wired up next."
      />
    </SectionShell>
  )
}
