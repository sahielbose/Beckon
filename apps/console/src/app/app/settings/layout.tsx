import { AppShell } from "@/components/app/app-shell"
import Link from "next/link"
import type { ReactNode } from "react"

const NAV = [
  { href: "/app/settings", label: "Account" },
  { href: "/app/settings/team", label: "Team" },
  { href: "/app/settings/keys", label: "API keys" },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10">
        <div className="grid gap-10 md:grid-cols-[180px_1fr]">
          <nav className="space-y-1 text-sm">
            <p className="px-2 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              Settings
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
      </div>
    </AppShell>
  )
}
