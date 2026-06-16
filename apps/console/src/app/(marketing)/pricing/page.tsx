import { Badge, Button, Reveal } from "@beckon/ui"
import { Check } from "lucide-react"
import Link from "next/link"

const SELF_HOST_INCLUDES = [
  "Unlimited agents",
  "Full source",
  "Your own keys and data",
  "Community support",
]

const HOSTED_INCLUDES = [
  "Managed updates",
  "Backups and monitoring",
  "Priority support",
  "Usage based pricing",
]

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden="true" />
          <span className="text-sm text-ink-muted">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PricingPage() {
  return (
    <main>
      <section className="mx-auto max-w-content px-6 py-20">
        <Reveal className="max-w-2xl space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Pricing</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Self host free. Hosted when you want it.
          </h1>
          <p className="text-lg text-ink-muted">
            Run the whole thing yourself at no cost, or wait for the hosted option and let us manage
            the infrastructure. No hidden tiers, no surprises.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-lg border border-line bg-bg p-8 shadow-rest">
              <h2 className="text-xl font-semibold text-ink">Self host</h2>
              <p className="mt-4 text-3xl font-semibold text-ink">Free</p>
              <p className="mt-4 text-sm text-ink-muted">
                Run the whole stack yourself with Docker Compose. Postgres, Redis, and storage
                included. MIT licensed.
              </p>
              <div className="mt-8">
                <Checklist items={SELF_HOST_INCLUDES} />
              </div>
              <div className="mt-8 pt-2">
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/docs">Read the docs</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col rounded-lg border border-line bg-bg p-8 shadow-rest">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-ink">Hosted</h2>
                <Badge variant="muted">Planned</Badge>
              </div>
              <p className="mt-4 text-3xl font-semibold text-ink-muted">Coming soon</p>
              <p className="mt-4 text-sm text-ink-muted">
                We run it for you. Same product, no infrastructure to manage.
              </p>
              <div className="mt-8">
                <Checklist items={HOSTED_INCLUDES} />
              </div>
              <div className="mt-8 pt-2">
                <Button asChild variant="primary" className="w-full">
                  <Link href="/signup">Start free</Link>
                </Button>
                <p className="mt-3 text-xs text-ink-faint">
                  Hosted is not live yet. Start on the free self host path today, and we will let
                  you know when hosted opens.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <p className="mt-12 max-w-2xl text-sm text-ink-muted">
            There are no hidden tiers. The core is open source under the MIT license, so you can
            read every line, run it anywhere, and keep your data.
          </p>
        </Reveal>
      </section>
    </main>
  )
}
