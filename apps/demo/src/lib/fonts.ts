import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import { Inter } from "next/font/google"

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
export const fontVariables = `${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`
