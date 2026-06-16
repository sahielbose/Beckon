import { AppShell } from "@/components/app/app-shell"
import { requireOrgId } from "@/server/current"
import { getAgentForOrg } from "@/server/queries"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

export default async function AgentLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const orgId = await requireOrgId()
  const agent = await getAgentForOrg(orgId, id)
  if (!agent) notFound()

  return <AppShell activeAgentId={id}>{children}</AppShell>
}
