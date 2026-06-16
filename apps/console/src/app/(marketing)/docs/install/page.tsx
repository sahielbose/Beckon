import { CodeBlock } from "@beckon/ui"
import Link from "next/link"

const reactSnippet = `<BeckonProvider agentId="agt_123" token="bpk_..." apiUrl="https://app.yourdomain.dev">
  <App />
  <BeckonCopilot position="right" width={400} />
</BeckonProvider>`

const scriptSnippet = `<script src="https://app.yourdomain.dev/embed.js" data-agent-id="agt_123" data-token="bpk_..."></script>`

export default function InstallPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Install</h1>

      <p className="max-w-2xl leading-relaxed text-ink-muted">
        There are two ways to embed Beckon in your app. Use the React components if you build with
        React, or use the script tag for any other site. Both connect to the same agent and give
        your users the same copilot.
      </p>

      <div className="space-y-3">
        <h2 className="font-semibold text-ink">React components</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          Wrap your app in BeckonProvider and render BeckonCopilot inside it. The provider connects
          to your agent, and the copilot is the panel your users chat in. Set apiUrl to the domain
          where your Beckon console runs.
        </p>
        <CodeBlock code={reactSnippet} />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-ink">Script tag</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          Add one line to your page and the widget loads itself. Put it before the closing body tag.
          This path works on any site, with no build step.
        </p>
        <CodeBlock code={scriptSnippet} />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-ink">Agent id and token</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          The agent id and the public embed token both come from the agent's Install tab. The token
          is safe to ship in your front end because it is scoped and only works from your allowed
          origins.
        </p>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          The widget shows a confirm card before anything that writes, so a user always approves an
          action that sends, posts, files, charges, or changes settings before it runs.
        </p>
      </div>

      <p className="max-w-2xl leading-relaxed text-ink-muted">
        For the full reference, see the{" "}
        <Link href="/docs/sdk" className="text-ink underline">
          SDK reference
        </Link>
        .
      </p>
    </div>
  )
}
