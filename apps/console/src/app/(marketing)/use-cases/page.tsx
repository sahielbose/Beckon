import { Reveal } from "@beckon/ui"
import { BookOpen, Compass, Zap } from "lucide-react"
import Link from "next/link"

const SCENARIOS = [
  {
    icon: Compass,
    title: "Navigate the app",
    body: "People move through your product by asking instead of clicking. Beckon opens records and routes the UI for them.",
    example: "Open the Acme account, then show their open deals.",
    note: null,
  },
  {
    icon: Zap,
    title: "Take actions",
    body: "People get work done by typing. Beckon calls your APIs and runs functions to make the change.",
    example: "Create a follow up task for tomorrow and assign it to me.",
    note: "Every write waits for a confirm step before it runs.",
  },
  {
    icon: BookOpen,
    title: "Answer from your docs",
    body: "People ask questions and get grounded answers. Beckon reads your content and replies in plain words.",
    example: "What is our refund window for annual plans?",
    note: "Every answer cites the exact source.",
  },
]

export default function UseCasesPage() {
  return (
    <main>
      <section className="mx-auto max-w-content px-6 py-20">
        <Reveal className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Use cases</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Three ways people use Beckon.</h1>
          <p className="max-w-xl text-lg text-ink-muted">
            People type what they want and Beckon does it: finding their way around, making changes,
            and getting answers from your content.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SCENARIOS.map((scenario) => (
            <Reveal key={scenario.title}>
              <div className="flex h-full flex-col space-y-3 rounded-lg border border-line bg-bg p-6 shadow-rest">
                <scenario.icon className="h-5 w-5 text-ink" aria-hidden="true" />
                <h2 className="text-base font-semibold text-ink">{scenario.title}</h2>
                <p className="text-sm text-ink-muted">{scenario.body}</p>
                <code className="block rounded-md bg-bg-subtle px-3 py-2 font-mono text-sm text-ink">
                  {scenario.example}
                </code>
                {scenario.note ? <p className="text-xs text-ink-faint">{scenario.note}</p> : null}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 space-y-5">
          <p className="max-w-xl text-ink-muted">
            One agent handles all three. The same Beckon that navigates your app also takes actions
            and answers from your docs, so people never switch tools to get what they need.
          </p>
          <Link
            href="/signup"
            className="inline-flex rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-colors duration-micro ease-standard hover:opacity-90"
          >
            Start free
          </Link>
        </Reveal>
      </section>
    </main>
  )
}
