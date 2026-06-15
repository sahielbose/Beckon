import "@beckon/ui/tokens.css"
import "./globals.css"
import { fontVariables } from "@/lib/fonts"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Beckon",
  description: "Open source, embeddable AI copilot layer for web apps.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
