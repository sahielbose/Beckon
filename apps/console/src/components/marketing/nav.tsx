import { auth } from "@/server/auth"
import { Button, Wordmark } from "@beckon/ui"
import Link from "next/link"

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
]

export async function MarketingNav() {
  // The bridge from the main site to the app. Open app routes to /app when signed
  // in, otherwise to /login, which returns to /app after sign in.
  const session = await auth()
  const openAppHref = session?.user ? "/app" : "/login"

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-3">
        <Link href="/" aria-label="Beckon home">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-micro ease-standard hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/sahielbose/Beckon"
            className="transition-colors duration-micro ease-standard hover:text-ink"
          >
            GitHub
          </a>
        </nav>
        <Link href={openAppHref}>
          <Button size="sm">Open app</Button>
        </Link>
      </div>
    </header>
  )
}
