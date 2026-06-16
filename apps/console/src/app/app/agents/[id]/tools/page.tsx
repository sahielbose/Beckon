import { SectionShell } from "@/components/app/section-shell"
import { type GatewayView, type ToolRow, ToolsManager } from "@/components/app/tools-manager"
import { getGatewayConfig, listTools } from "@/server/queries"

export default async function ToolsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tools, gateway] = await Promise.all([listTools(id), getGatewayConfig(id)])

  const toolRows: ToolRow[] = tools.map((t) => ({
    id: t.id,
    name: t.name,
    method: t.httpMethod,
    description: t.description,
    sideEffect: t.sideEffect,
    requiresConfirmation: t.requiresConfirmation,
    enabled: t.enabled,
  }))

  const gatewayView: GatewayView = gateway
    ? {
        baseUrl: gateway.baseUrl,
        authType: gateway.authType,
        authHeaderName: gateway.authHeaderName,
        rateLimitPerMin: gateway.rateLimitPerMin,
        hasAuthSecret: Boolean(gateway.authSecretEncrypted),
        hasSharedSecret: Boolean(gateway.sharedSecretEncrypted),
      }
    : null

  return (
    <SectionShell
      title="Tools"
      description="Import an OpenAPI spec so each operation becomes a callable tool. Writes are gated by default."
    >
      <ToolsManager agentId={id} tools={toolRows} gateway={gatewayView} />
    </SectionShell>
  )
}
