import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import { Inter } from "next/font/google"

// Self hosted at build time by next/font and the geist package. No hotlinking.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const fontVariables = `${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`
