import { HeroDemo } from "@/components/marketing/hero-demo"
import { Card, Reveal, Stagger, StaggerItem } from "@beckon/ui"
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
      <section className="relative overflow-hidden border-b border-line bg-spotlight">
        <div
          className="pointer-events-none absolute inset-0 bg-grid bg-grid-cell opacity-[0.35] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-content items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-28">
          <Reveal className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              Embeddable AI copilot
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Let your users run your app by chat.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
              Beckon drops into any web app so people do things by typing: call your APIs, run
              functions, navigate your UI. It acts, it does not just answer. Every action that
              writes waits for a confirm step.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/signup"
                className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-bg transition duration-micro ease-standard hover:opacity-90 active:scale-[0.98]"
              >
                Start free
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-md border border-line bg-bg px-4 py-2.5 text-sm font-medium text-ink transition duration-micro ease-standard hover:bg-bg-subtle"
              >
                See how it works
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:pl-6">
            <HeroDemo />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-bg-subtle">
        <div className="mx-auto max-w-content px-6 py-14">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              From spec to shipped
            </p>
          </Reveal>
          <Stagger className="mt-6 grid gap-6 sm:grid-cols-3 lg:grid-cols-5" delay={0.05}>
            {STEPS.map((step) => (
              <StaggerItem key={step.n} className="space-y-1">
                <span className="font-mono text-sm text-ink-faint">{step.n}</span>
                <p className="text-sm font-medium text-ink">{step.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-20 lg:py-24">
        <Reveal className="space-y-3">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            The trust layer is the product.
          </h2>
          <p className="max-w-xl text-ink-muted">
            The model is the easy part. The durable work is reliability: the gateway, the
            guardrails, and grounded answers.
          </p>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" delay={0.05}>
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title} className="h-full">
              <Card interactive className="h-full space-y-3 p-6">
                <feature.icon className="h-5 w-5 text-ink" aria-hidden="true" />
                <h3 className="text-base font-semibold text-ink">{feature.title}</h3>
                <p className="text-sm text-ink-muted">{feature.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-line bg-bg-subtle">
        <div className="mx-auto flex max-w-content flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <Reveal className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Drop it in and watch it work.
            </h2>
            <p className="max-w-xl text-ink-muted">
              Self host the whole stack for free, or read the docs to see the install path.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-bg transition duration-micro ease-standard hover:opacity-90 active:scale-[0.98]"
            >
              Start free
            </Link>
            <Link
              href="/docs"
              className="rounded-md border border-line bg-bg px-4 py-2.5 text-sm font-medium text-ink transition duration-micro ease-standard hover:bg-bg-subtle"
            >
              Read the docs
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
