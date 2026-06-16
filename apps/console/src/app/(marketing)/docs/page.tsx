import { CodeBlock, Reveal, Stagger, StaggerItem } from "@beckon/ui"

const reactSnippet = `<BeckonProvider agentId="agt_123" apiUrl="https://app.yourdomain.dev">
  <App />
  <BeckonCopilot position="right" width={400} />
</BeckonProvider>`

const scriptSnippet = `<script src="https://app.yourdomain.dev/embed.js" data-agent-id="agt_123"></script>`

export default function GettingStartedPage() {
  return (
    <article className="space-y-10">
      <Reveal>
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Getting started</h1>
          <p className="leading-relaxed text-ink-muted">
            Beckon is a copilot layer you drop into your web app. Your users get things done by chat
            instead of clicking through menus. Set up an agent in the console, then add it to your
            app in a few lines. Here is the path from a blank account to a working copilot.
          </p>
        </header>
      </Reveal>

      <Reveal>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Steps</h2>
          <ol className="list-decimal space-y-2 pl-5 leading-relaxed text-ink-muted marker:text-ink-faint">
            <li>Create an account and a workspace in the console.</li>
            <li>Create an agent. It gets an id like agt_123 that you use to embed it.</li>
            <li>Add knowledge and tools so the agent can answer questions and act in your app.</li>
            <li>Install the agent in your app with one of the snippets below.</li>
          </ol>
        </section>
      </Reveal>

      <section className="space-y-6">
        <Reveal>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-ink">Install</h2>
            <p className="leading-relaxed text-ink-muted">
              Pick the path that fits your app. Use the React package if you build with React, or
              the script tag for any other site.
            </p>
          </div>
        </Reveal>

        <Stagger className="space-y-6" delay={0.05} stagger={0.08}>
          <StaggerItem className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">React</p>
            <p className="leading-relaxed text-ink-muted">
              Wrap your app in BeckonProvider and render BeckonCopilot inside it. The provider
              connects to your agent, the copilot is the panel your users chat in. Set apiUrl to the
              domain where your Beckon console runs.
            </p>
            <CodeBlock code={reactSnippet} />
          </StaggerItem>

          <StaggerItem className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              Script tag
            </p>
            <p className="leading-relaxed text-ink-muted">
              Add one line to your page and the widget loads itself. Put it before the closing body
              tag and set data-agent-id to your agent. This path works on any site, no build step.
            </p>
            <CodeBlock code={scriptSnippet} />
          </StaggerItem>
        </Stagger>
      </section>

      <Reveal>
        <section className="space-y-2 border-t border-line pt-6">
          <p className="leading-relaxed text-ink-muted">
            The SDK reference, OpenAPI import, Gateway, and Security pages are filled in a later
            section.
          </p>
        </section>
      </Reveal>
    </article>
  )
}
