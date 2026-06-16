import "@beckon/ui/tokens.css"
import "./globals.css"
import { DemoCopilot } from "@/components/demo-copilot"
import { fontVariables } from "@/lib/fonts"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Acme CRM, a Beckon demo",
  description: "A sample CRM with Beckon embedded.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {children}
        <DemoCopilot />
      </body>
    </html>
  )
}
