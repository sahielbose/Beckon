import { InstallManager, type OriginRow } from "@/components/app/install-manager"
import { SectionShell } from "@/components/app/section-shell"
import { listOrigins } from "@/server/queries"

export default async function InstallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const origins = await listOrigins(id)
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const originRows: OriginRow[] = origins.map((o) => ({ id: o.id, origin: o.origin }))

  return (
    <SectionShell
      title="Install"
      description="Copy a snippet, create an embed token, and set your allowed origins."
    >
      <InstallManager agentId={id} apiUrl={apiUrl} origins={originRows} />
    </SectionShell>
  )
}
