import { Reveal } from "@beckon/ui"
import Link from "next/link"

const STEPS = [
  {
    n: "01",
    title: "Connect knowledge",
    body: "Upload files or add URLs. Beckon ingests them so the agent can answer from your own content, with citations to the exact source.",
  },
  {
    n: "02",
    title: "Wire tools",
    body: "Import an OpenAPI spec and each operation becomes a callable tool. Writes (POST, PUT, PATCH, DELETE) are gated by default.",
  },
  {
    n: "03",
    title: "Set guardrails",
    body: "Choose which tools the agent may use, and require a confirm step before anything that writes. A blocked tool is never callable.",
  },
  {
    n: "04",
    title: "Install",
    body: "Copy a React snippet or a script tag, set your allowed origins, and the widget is live. No product rebuild.",
  },
  {
    n: "05",
    title: "Watch",
    body: "Every conversation, tool call, and action is logged and traceable back to a user, so you see what people ask and where things break.",
  },
]

export default function HowItWorksPage() {
  return (
    <main>
      <section className="mx-auto max-w-content px-6 py-20">
        <Reveal className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            How it works
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            From your API to a working copilot.
          </h1>
          <p className="max-w-xl text-lg text-ink-muted">
            Five steps take you from raw content and an API spec to a copilot that acts, answers
            from your own sources, and stays inside the limits you set.
          </p>
        </Reveal>

        <ol className="mt-16 space-y-12">
          {STEPS.map((step, index) => (
            <Reveal key={step.n} delay={index * 0.05}>
              <li className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8">
                <span
                  className="font-mono text-4xl font-semibold text-ink-faint sm:text-5xl"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-ink sm:text-2xl">{step.title}</h2>
                  <p className="max-w-2xl text-ink-muted">{step.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-16 flex flex-wrap gap-3 border-t border-line pt-12">
          <Link
            href="/signup"
            className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-colors duration-micro ease-standard hover:opacity-90"
          >
            Start free
          </Link>
          <Link
            href="/docs"
            className="rounded-md border border-line bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-micro ease-standard hover:bg-bg-subtle"
          >
            Read the docs
          </Link>
        </Reveal>
      </section>
    </main>
  )
}
