import { Wordmark } from "@beckon/ui"
import Link from "next/link"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/">
        <Wordmark />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  )
}
