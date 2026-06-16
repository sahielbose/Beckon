import { CodeBlock } from "@beckon/ui"
import Link from "next/link"

const providerSnippet = `import { BeckonProvider, BeckonWidget } from "@beckon/react"

const tools = {
  openProfitAndLoss: {
    description: "Open the P&L view",
    handler: () => {},
  },
}

export function App() {
  return (
    <BeckonProvider
      agentId="agt_123"
      apiUrl="https://app.yourdomain.dev"
      token={sessionToken}
      onIdentify={() => ({ id: "user_42", name: "Ada" })}
      tools={tools}
    >
      <YourApp />
      <BeckonWidget agentName="Copilot" defaultOpen={false} />
    </BeckonProvider>
  )
}`

const copilotSnippet = `<BeckonCopilot position="right" width={400} agentName="Copilot" defaultOpen={false} />`

const toolSnippet = `const tools = {
  openProfitAndLoss: {
    description: "Open the P&L view",
    handler: () => {},
  },
  archiveInvoice: {
    description: "Archive the open invoice",
    sideEffect: true,
    handler: (input) => archive(input.id),
  },
}`

const clientSnippet = `import { createBeckonClient } from "@beckon/client"

const client = createBeckonClient({
  agentId: "agt_123",
  apiUrl: "https://app.yourdomain.dev",
  tools,
})`

export default function SdkReferencePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">SDK reference</h1>
      <p className="max-w-2xl leading-relaxed text-ink-muted">
        The React SDK ships as @beckon/react. It gives you a provider that connects your app to an
        agent and two ways to show the copilot to your users. Wrap your app once, then pick the
        surface that fits your layout. For getting set up, see{" "}
        <Link href="/docs/install" className="text-ink underline">
          Install
        </Link>
        .
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">BeckonProvider</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          BeckonProvider holds the connection to your agent. Wrap your app in it once, near the
          root, so the copilot and your host functions share one session.
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-ink-muted marker:text-ink-faint">
          <li>
            <span className="font-mono text-ink">agentId</span>: the id of the agent to load, like
            agt_123.
          </li>
          <li>
            <span className="font-mono text-ink">apiUrl</span>: the domain where your Beckon console
            runs.
          </li>
          <li>
            <span className="font-mono text-ink">token</span>: the session token that authorizes the
            user with your backend.
          </li>
          <li>
            <span className="font-mono text-ink">onIdentify</span>: a function that returns who the
            current user is, so the agent has context.
          </li>
          <li>
            <span className="font-mono text-ink">tools</span>: a map of host functions the agent can
            call in your app.
          </li>
        </ul>
        <CodeBlock code={providerSnippet} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">BeckonWidget</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          BeckonWidget is a floating bubble that opens a chat panel. It sits over your app and stays
          out of the way until a user clicks it.
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-ink-muted marker:text-ink-faint">
          <li>
            <span className="font-mono text-ink">config</span>: options that tune how the bubble
            looks and behaves.
          </li>
          <li>
            <span className="font-mono text-ink">agentName</span>: the name shown at the top of the
            panel.
          </li>
          <li>
            <span className="font-mono text-ink">defaultOpen</span>: whether the panel starts open.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">BeckonCopilot</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          BeckonCopilot is a sidebar that docks to one side of the screen. Use it when you want the
          copilot in view next to your app rather than as a bubble.
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-ink-muted marker:text-ink-faint">
          <li>
            <span className="font-mono text-ink">position</span>: which side the sidebar docks to,
            left or right.
          </li>
          <li>
            <span className="font-mono text-ink">width</span>: the width of the sidebar in pixels.
          </li>
          <li>
            <span className="font-mono text-ink">agentName</span>: the name shown at the top of the
            sidebar.
          </li>
          <li>
            <span className="font-mono text-ink">defaultOpen</span>: whether the sidebar starts
            open.
          </li>
        </ul>
        <CodeBlock code={copilotSnippet} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Host functions</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          The tools map is how the agent acts in your app. Each key is the function name the agent
          calls. Each entry has three parts: a description that tells the agent what the function
          does, an optional sideEffect flag, and a handler that runs the work.
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-ink-muted marker:text-ink-faint">
          <li>
            <span className="font-mono text-ink">description</span>: a short line the agent reads to
            decide when to call the function.
          </li>
          <li>
            <span className="font-mono text-ink">sideEffect</span>: set this to true when the
            function changes data or state.
          </li>
          <li>
            <span className="font-mono text-ink">handler</span>: the function that runs in your app
            when the agent calls it.
          </li>
        </ul>
        <CodeBlock code={toolSnippet} />
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          Any side effecting host function still goes through the confirm step. The agent asks the
          user to approve before the handler runs, so an action that changes data never happens on
          its own.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Non React hosts</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          If you do not build with React, the browser core @beckon/client gives you the same
          connection and tools without the components. You wire the copilot to your own interface
          and register the same host functions.
        </p>
        <CodeBlock code={clientSnippet} />
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          The confirm step applies here too. A side effecting host function called through
          @beckon/client still asks the user to approve before it runs.
        </p>
      </section>
    </div>
  )
}
