import { Wordmark } from "@beckon/ui"
import Link from "next/link"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "https://github.com/sahielbose/Beckon", label: "GitHub" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-bg-subtle">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
        <div className="space-y-3">
          <Link
            href="/"
            aria-label="Beckon home"
            className="inline-flex rounded-sm transition-opacity duration-micro ease-standard hover:opacity-80"
          >
            <Wordmark />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
            Open source, embeddable AI copilot layer for web apps.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              {column.title}
            </p>
            <ul className="space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-sm text-ink-muted transition-colors duration-micro ease-standard hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-content px-6 py-6 text-xs text-ink-faint">
          MIT licensed. Built in the open.
        </p>
      </div>
    </footer>
  )
}
