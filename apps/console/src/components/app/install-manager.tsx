"use client"

import { addOriginAction, createEmbedTokenAction, removeOriginAction } from "@/server/actions/keys"
import { Button, Card, CardContent, CodeBlock, CopyButton, EmptyState, Input } from "@beckon/ui"
import { Globe } from "lucide-react"
import { useActionState, useState, useTransition } from "react"

export type OriginRow = { id: string; origin: string }

export function InstallManager({
  agentId,
  apiUrl,
  origins,
}: {
  agentId: string
  apiUrl: string
  origins: OriginRow[]
}) {
  const [token, setToken] = useState<string | null>(null)
  const [creating, startCreate] = useTransition()
  const [originState, addOrigin, addingOrigin] = useActionState(addOriginAction, {})

  const tokenValue = token ?? "YOUR_EMBED_TOKEN"
  const reactSnippet = `<BeckonProvider agentId="${agentId}" token="${tokenValue}" apiUrl="${apiUrl}">
  <App />
  <BeckonCopilot position="right" width={400} />
</BeckonProvider>`
  const scriptSnippet = `<script src="${apiUrl}/embed.js" data-agent-id="${agentId}" data-token="${tokenValue}"></script>`

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Embed token</h2>
          <p className="text-sm text-ink-muted">
            A public token scoped to this agent. Safe to ship in your page. It only works from your
            allowed origins.
          </p>
        </div>
        {token ? (
          <Card className="border-line-strong">
            <CardContent className="space-y-3 pt-5">
              <p className="text-sm font-medium">Copy this token now. You will not see it again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-md border border-line bg-bg-subtle px-3 py-2 font-mono text-sm">
                  {token}
                </code>
                <CopyButton value={token} />
              </div>
            </CardContent>
          </Card>
        ) : null}
        <Button
          disabled={creating}
          onClick={() =>
            startCreate(async () => {
              const result = await createEmbedTokenAction(agentId)
              if (result.token) setToken(result.token)
            })
          }
        >
          Create embed token
        </Button>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Install</h2>
          <p className="text-sm text-ink-muted">
            Use the React components, or the script tag for any site. Paste your embed token in.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">React</p>
          <CodeBlock code={reactSnippet} />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Script tag</p>
          <CodeBlock code={scriptSnippet} />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Allowed origins</h2>
          <p className="text-sm text-ink-muted">
            The widget only runs on these origins. Add the sites where you embed it.
          </p>
        </div>
        <form action={addOrigin} className="flex max-w-xl gap-2">
          <input type="hidden" name="agentId" value={agentId} />
          <Input name="origin" placeholder="https://app.yourcompany.com" />
          <Button type="submit" disabled={addingOrigin}>
            Add origin
          </Button>
        </form>
        {originState.error ? <p className="text-sm text-danger">{originState.error}</p> : null}

        {origins.length === 0 ? (
          <EmptyState
            icon={<Globe className="h-5 w-5 text-ink-faint" />}
            title="No origins yet"
            description="Add the origin of the site where the widget will run."
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {origins.map((origin) => (
              <li
                key={origin.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5 transition-colors duration-micro ease-standard hover:bg-bg-subtle"
              >
                <code className="truncate font-mono text-sm text-ink">{origin.origin}</code>
                <form action={removeOriginAction}>
                  <input type="hidden" name="agentId" value={agentId} />
                  <input type="hidden" name="originId" value={origin.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
