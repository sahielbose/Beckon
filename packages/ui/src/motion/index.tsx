"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

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

export { EASE as standardEase }
