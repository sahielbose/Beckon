"use client"

import { cn } from "@beckon/ui"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"

// Scroll aware shell for the marketing nav. Stays sticky and, once the page is
// scrolled past a small threshold, condenses: tighter vertical padding, a real
// border, and a soft shadow. Transitions use the standard easing and a short
// duration. Reduced motion is respected: the styling still changes, but the
// transition is removed so there is no animated movement.
export function MarketingNavShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-40 bg-bg/80 backdrop-blur",
        "border-b transition-[padding,box-shadow,border-color] duration-standard ease-standard",
        "motion-reduce:transition-none",
        scrolled ? "border-line shadow-rest" : "border-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-content items-center justify-between gap-6 px-6",
          "transition-[padding] duration-standard ease-standard motion-reduce:transition-none",
          scrolled ? "py-2" : "py-3.5",
        )}
      >
        {children}
      </div>
    </header>
  )
}
