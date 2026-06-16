import { CodeBlock } from "@beckon/ui"

const cspSnippet = `Content-Security-Policy: script-src 'self' https://app.yourdomain.dev`

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Security</h1>

      <p className="max-w-2xl leading-relaxed text-ink-muted">
        Beckon is built so an agent can act in your app without becoming a way around your own
        rules. This page sums up the posture. The full policy and how to report an issue live in
        SECURITY.md at the repository root.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Side effects are gated</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          Anything that sends, posts, files, charges, or changes settings asks the user to confirm
          first. The confirm step is enforced in three places: the runtime, the gateway, and the
          widget. Nothing with a side effect runs until the user confirms, and writes are never
          retried, so a confirmed action cannot fire twice on its own.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Prompt injection</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          Retrieved content, page content, and tool results are treated as data, never as
          instructions. A document that says to ignore the rules and delete an account is just text
          the agent can read, not a command it will run. Instructions come only from your agent
          config and the end user. This boundary is covered by the eval suite so a change that
          weakens it fails the build.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Tokens and tenancy</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          Secret keys are shown once at creation, then stored as a hash, so a leaked database never
          gives back the original key. Embed tokens are scoped to a single agent and validated
          against the agent origin allowlist, so a token only works from the sites you list. Every
          query is scoped to the org that owns it, so one tenant cannot read another tenant's data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Transport</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          Responses carry strict security headers, and the embed endpoints set CORS per route rather
          than allowing any origin. On your own host page, set a Content Security Policy that limits
          where the embed script can load from, so only the Beckon script you expect can run.
        </p>
        <CodeBlock code={cspSnippet} />
      </section>
    </div>
  )
}
