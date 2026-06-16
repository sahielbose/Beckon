import { MarketingNavShell } from "@/components/marketing/nav-shell"
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
  // in, otherwise to /login, which returns to /app after sign in. The server
  // component computes this href and the scroll behavior lives in the client
  // shell, which only handles styling.
  const session = await auth()
  const openAppHref = session?.user ? "/app" : "/login"

  return (
    <MarketingNavShell>
      <Link
        href="/"
        aria-label="Beckon home"
        className="rounded-sm transition-opacity duration-micro ease-standard hover:opacity-80"
      >
        <Wordmark />
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-sm transition-colors duration-micro ease-standard hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
        <a
          href="https://github.com/sahielbose/Beckon"
          className="rounded-sm transition-colors duration-micro ease-standard hover:text-ink"
        >
          GitHub
        </a>
      </nav>
      <Button asChild size="sm">
        <Link href={openAppHref}>Open app</Link>
      </Button>
    </MarketingNavShell>
  )
}
