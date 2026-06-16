import { HeroDemo } from "@/components/marketing/hero-demo"
import { Reveal } from "@beckon/ui"
import { ClipboardList, KeyRound, MessageSquare, Network, ShieldCheck, Wrench } from "lucide-react"
import Link from "next/link"

const STEPS = [
  { n: "01", label: "Connect knowledge" },
  { n: "02", label: "Wire tools" },
  { n: "03", label: "Set guardrails" },
  { n: "04", label: "Install" },
  { n: "05", label: "Watch" },
]

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Acts, it does not just answer",
    body: "The widget takes real actions: it calls your APIs, runs client functions, and navigates your UI.",
  },
  {
    icon: ShieldCheck,
    title: "A gateway you can trust",
    body: "Every server call is validated, rate limited, signed with a shared secret, and logged with secrets redacted.",
  },
  {
    icon: KeyRound,
    title: "Confirm before any write",
    body: "Anything that sends, posts, charges, or changes settings stops for an explicit confirm step first.",
  },
  {
    icon: ClipboardList,
    title: "Grounded in your content",
    body: "Answers cite the exact source. No invented citations, ever.",
  },
  {
    icon: Wrench,
    title: "Tools from your OpenAPI spec",
    body: "Import a spec and each operation becomes a callable tool, with writes gated by default.",
  },
  {
    icon: Network,
    title: "Flows and guardrails",
    body: "Steer multi step workflows and set exactly what the agent may and may not do.",
  },
]

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-content items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <Reveal className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            Embeddable AI copilot
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Let your users run your app by chat.
          </h1>
          <p className="max-w-xl text-lg text-ink-muted">
            Beckon drops into any web app so people do things by typing: call your APIs, run
            functions, navigate your UI. It acts, it does not just answer. Every action that writes
            waits for a confirm step.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-colors duration-micro ease-standard hover:opacity-90"
            >
              Start free
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-md border border-line bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-micro ease-standard hover:bg-bg-subtle"
            >
              See how it works
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:pl-6">
          <HeroDemo />
        </Reveal>
      </section>

      <section className="border-y border-line bg-bg-subtle">
        <div className="mx-auto max-w-content px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            From spec to shipped
          </p>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((step) => (
              <li key={step.n} className="space-y-1">
                <span className="font-mono text-sm text-ink-faint">{step.n}</span>
                <p className="text-sm font-medium text-ink">{step.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-20">
        <h2 className="max-w-2xl text-2xl font-semibold sm:text-3xl">
          The trust layer is the product.
        </h2>
        <p className="mt-3 max-w-xl text-ink-muted">
          The model is the easy part. The durable work is reliability: the gateway, the guardrails,
          and grounded answers.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Reveal key={feature.title}>
              <div className="h-full space-y-3 rounded-lg border border-line bg-bg p-6 shadow-rest">
                <feature.icon className="h-5 w-5 text-ink" aria-hidden="true" />
                <h3 className="text-base font-semibold text-ink">{feature.title}</h3>
                <p className="text-sm text-ink-muted">{feature.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  )
}
