import { requireUser } from "@/server/current"
import type { ReactNode } from "react"

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Gate every app route. The full shell (sidebar, top bar) lands in Section 5.
  await requireUser()
  return children
}
