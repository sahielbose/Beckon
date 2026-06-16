"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "../lib/cn"

// Quiet, reduced motion aware entrance. Opacity 0 to 1 with a small upward
// translate, gentle easing, no bounce. Disabled entirely under reduced motion.

const EASE = [0.2, 0, 0, 1] as const

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.28, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

// Container that staggers the entrance of its direct children by a small delay.
// Each child fades in with the same quiet upward translate as Reveal and FadeIn.
// Under reduced motion the whole group renders statically with no animation.
export function Stagger({
  children,
  delay = 0,
  stagger = 0.06,
  className,
}: {
  children: ReactNode
  delay?: number
  stagger?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  )
}

// A single staggered child. Use inside Stagger to opt an element into the
// sequence. Plain children also fade in via the parent, but this gives the
// quiet upward translate per item.
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Small, quiet monochrome loading spinner in the ink color. A thin ring with one
// open quadrant that rotates. Under reduced motion it shows as a static ring.
export function Spinner({
  className,
  label = "Loading",
}: {
  className?: string
  label?: string
}) {
  const reduce = useReducedMotion()
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block h-4 w-4 rounded-full border-2 border-line border-t-ink",
        !reduce && "animate-spin",
        className,
      )}
    />
  )
}

export { EASE as standardEase }
