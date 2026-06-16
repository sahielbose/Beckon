"use client"

import { Check } from "lucide-react"
import { useEffect, useState } from "react"

// A scripted preview of the command surface, showing the confirm step before a
// write runs. The real, live instance driving the demo app lands in Section 13.
// Respects reduced motion by rendering the finished state with no animation.

type Line = { role: "user" | "agent"; text: string }

const SCRIPT: Line[] = [
  { role: "user", text: "Create a client named Acme" },
  { role: "agent", text: "I can create the client Acme. This adds a record to your CRM." },
  { role: "agent", text: "Created the client Acme." },
  { role: "agent", text: "Done. Want me to open their profit and loss?" },
]

// Step indices: 0 user, 1 agent intent, 2 confirm card, 3 confirmed, 4 follow up.
const STEP_DELAYS = [700, 1100, 1400, 1200, 2600]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = () => setReduced(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

export function HeroDemo() {
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduced) {
      setStep(4)
      return
    }
    const delay = STEP_DELAYS[step] ?? 2000
    const timer = setTimeout(() => setStep((s) => (s + 1) % (STEP_DELAYS.length + 1)), delay)
    return () => clearTimeout(timer)
  }, [step, reduced])

  const showUser = step >= 0
  const showIntent = step >= 1
  const showConfirm = step === 2
  const showConfirmed = step >= 3
  const showFollowUp = step >= 4

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg shadow-rest">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Beckon
        </span>
      </div>
      <div className="space-y-3 p-4 font-mono text-sm leading-relaxed">
        {showUser ? (
          <div className="flex gap-2 text-ink">
            <span className="select-none text-ink-faint">{">"}</span>
            <span>{SCRIPT[0].text}</span>
          </div>
        ) : null}

        {showIntent ? (
          <div className="flex gap-2 text-ink-muted">
            <span className="select-none text-ink-faint">·</span>
            <span>{SCRIPT[1].text}</span>
          </div>
        ) : null}

        {showConfirm ? (
          <div className="rounded-md border border-line-strong bg-bg-subtle p-3">
            <p className="text-xs uppercase tracking-wide text-ink-faint">Confirm to continue</p>
            <p className="mt-1 text-ink">Create client: Acme</p>
            <div className="mt-3 flex gap-2">
              <span className="rounded-md bg-ink px-2.5 py-1 text-xs text-bg">Confirm</span>
              <span className="rounded-md border border-line px-2.5 py-1 text-xs text-ink-muted">
                Cancel
              </span>
            </div>
          </div>
        ) : null}

        {showConfirmed ? (
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            <span className="text-ink-muted">{SCRIPT[2].text}</span>
          </div>
        ) : null}

        {showFollowUp ? (
          <div className="flex gap-2 text-ink-muted">
            <span className="select-none text-ink-faint">·</span>
            <span>{SCRIPT[3].text}</span>
          </div>
        ) : null}

        <div className="flex gap-2 text-ink">
          <span className="select-none text-ink-faint">{">"}</span>
          <span className="beckon-caret" />
        </div>
      </div>
    </div>
  )
}
