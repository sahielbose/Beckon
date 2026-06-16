import { AppShell } from "@/components/app/app-shell"
import { SettingsNav } from "@/components/app/settings-nav"
import { FadeIn } from "@beckon/ui"
import type { ReactNode } from "react"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[180px_1fr] md:gap-10">
          <SettingsNav />
          <FadeIn className="max-w-2xl">{children}</FadeIn>
        </div>
      </div>
    </AppShell>
  )
}
