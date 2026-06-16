import Link from "next/link"
import type { ReactNode } from "react"

const NAV = [
  { href: "/docs", label: "Getting started" },
  { href: "/docs/install", label: "Install" },
  { href: "/docs/sdk", label: "SDK reference" },
  { href: "/docs/openapi", label: "OpenAPI import" },
  { href: "/docs/gateway", label: "Gateway" },
  { href: "/docs/security", label: "Security" },
]

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1 text-sm md:sticky md:top-24 md:self-start">
          <p className="px-2 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            Docs
          </p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-2 py-1.5 text-ink-muted transition-colors duration-micro ease-standard hover:bg-bg-subtle hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="max-w-2xl">{children}</div>
      </div>
    </main>
  )
}
