import { KeysManager } from "@/components/keys-manager"
import { requireOrgId } from "@/server/current"
import { listSecretKeys } from "@/server/queries"

export default async function KeysSettingsPage() {
  const orgId = await requireOrgId()
  const keys = await listSecretKeys(orgId)

  const rows = keys.map((key) => ({
    id: key.id,
    keyPrefix: key.keyPrefix,
    created: new Date(key.createdAt).toLocaleDateString(),
    revoked: Boolean(key.revokedAt),
  }))

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">API keys</h1>
        <p className="text-sm text-ink-muted">
          Secret keys call the management API from your server. A key is shown once when you create
          it. Embed tokens for the widget are created on each agent's install page.
        </p>
      </div>
      <KeysManager keys={rows} />
    </section>
  )
}
