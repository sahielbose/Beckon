"use client"

import { Check } from "lucide-react"
import { useEffect, useReducer, useRef, useState } from "react"
import { MockAppPanel, type MockClient } from "./mock-app-panel"

// The signature live hero. A monospace command surface that types a real request,
// streams a short agent reply, stops for an explicit confirm (this is a write), then
// visibly performs one action in the mini CRM panel beside it: a new "Acme" row
// appears with a calm highlight. It pauses, resets, and loops.
//
// For prefers-reduced-motion we render the finished state once, with no animation and
// no looping: the request is shown in full, the confirmed reply is shown, and Acme is
// already present in the panel. The component owns all of its timers and state.

// The request the user "types", and the reply the agent "streams" token by token.
const REQUEST = "Create a client named Acme"
const REPLY_TOKENS = [
  "I",
  "can",
  "create",
  "the",
  "client",
  "Acme.",
  "Confirm",
  "to",
  "add",
  "the",
  "record.",
]

// The seed CRM rows, plus the row the agent adds on confirm. Kept here so the static
// fallback and the live loop share one source of truth.
const SEED_CLIENTS: MockClient[] = [
  { id: "northwind", name: "Northwind", plan: "Pro" },
  { id: "globex", name: "Globex", plan: "Team" },
]
const NEW_CLIENT: MockClient = { id: "acme", name: "Acme", plan: "Pro" }
const FINISHED_CLIENTS: MockClient[] = [...SEED_CLIENTS, NEW_CLIENT]

// Cadence, all gently eased by the global reduced-motion-safe transitions. Calm, not
// frantic: a steady type, a slightly slower stream, deliberate pauses to read.
const TYPE_MS = 55 // per character
const STREAM_MS = 95 // per token
const PAUSE_AFTER_TYPE = 450
const PAUSE_BEFORE_CONFIRM = 550
const PAUSE_ON_CONFIRM = 900 // dwell on the confirm card so it reads as a decision
const PAUSE_AFTER_ACTION = 2600 // hold the finished state before the loop resets
const RESET_PAUSE = 700

// The phases of one loop. Linear; each phase schedules the next.
type Phase = "typing" | "thinking" | "streaming" | "confirm" | "done" | "reset"

type State = {
  phase: Phase
  typed: string // characters of REQUEST revealed so far
  tokens: number // count of REPLY_TOKENS revealed so far
  confirmed: boolean // whether the confirm card resolved to Confirm
  clients: MockClient[]
  highlightedId: string | null
}

const INITIAL: State = {
  phase: "typing",
  typed: "",
  tokens: 0,
  confirmed: false,
  clients: SEED_CLIENTS,
  highlightedId: null,
}

type Action =
  | { type: "type" } // reveal one more character
  | { type: "thinking" }
  | { type: "stream" } // reveal one more token
  | { type: "confirm" } // show the confirm card
  | { type: "resolve" } // user confirms: perform the action
  | { type: "settle" } // drop the highlight after the action reads
  | { type: "reset" }
  | { type: "restart" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "type":
      return { ...state, phase: "typing", typed: REQUEST.slice(0, state.typed.length + 1) }
    case "thinking":
      return { ...state, phase: "thinking" }
    case "stream":
      return {
        ...state,
        phase: "streaming",
        tokens: Math.min(state.tokens + 1, REPLY_TOKENS.length),
      }
    case "confirm":
      return { ...state, phase: "confirm" }
    case "resolve":
      return {
        ...state,
        phase: "done",
        confirmed: true,
        clients: FINISHED_CLIENTS,
        highlightedId: NEW_CLIENT.id,
      }
    case "settle":
      return { ...state, highlightedId: null }
    case "reset":
      return { ...state, phase: "reset" }
    case "restart":
      return INITIAL
    default:
      return state
  }
}

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
  const [state, dispatch] = useReducer(reducer, INITIAL)

  // One self managing timer chain. Each render schedules the next step based on the
  // current phase and progress, and clears itself on cleanup so phases never overlap.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (reduced) return
    if (timer.current) clearTimeout(timer.current)

    const wait = (ms: number, action: Action) => {
      timer.current = setTimeout(() => dispatch(action), ms)
    }

    switch (state.phase) {
      case "typing":
        if (state.typed.length < REQUEST.length) {
          wait(TYPE_MS, { type: "type" })
        } else {
          wait(PAUSE_AFTER_TYPE, { type: "thinking" })
        }
        break
      case "thinking":
        wait(420, { type: "stream" })
        break
      case "streaming":
        if (state.tokens < REPLY_TOKENS.length) {
          wait(STREAM_MS, { type: "stream" })
        } else {
          wait(PAUSE_BEFORE_CONFIRM, { type: "confirm" })
        }
        break
      case "confirm":
        wait(PAUSE_ON_CONFIRM, { type: "resolve" })
        break
      case "done":
        // Let the highlight read, then drop it, then hold before reset.
        if (state.highlightedId) {
          wait(1100, { type: "settle" })
        } else {
          wait(PAUSE_AFTER_ACTION, { type: "reset" })
        }
        break
      case "reset":
        wait(RESET_PAUSE, { type: "restart" })
        break
      default:
        break
    }

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [state.phase, state.typed.length, state.tokens, state.highlightedId, reduced])

  // Derive what the surface shows. In reduced motion we jump straight to the finished
  // state: full request, full reply, confirmed, Acme present, no highlight, no loop.
  const typed = reduced ? REQUEST : state.typed
  const revealedTokens = reduced ? REPLY_TOKENS : REPLY_TOKENS.slice(0, state.tokens)
  const replyText = revealedTokens.join(" ")

  const showReply =
    reduced ||
    state.phase === "streaming" ||
    state.phase === "confirm" ||
    state.phase === "done" ||
    state.phase === "reset"
  const showConfirmCard = !reduced && state.phase === "confirm"
  const showConfirmed = reduced || (!reduced && (state.phase === "done" || state.phase === "reset"))
  const typingActive = !reduced && state.phase === "typing"
  // The caret sits on the prompt line while typing, otherwise it parks on a fresh
  // prompt line at the bottom, ready for the next request.
  const promptCaret = reduced ? false : !typingActive

  const clients = reduced ? FINISHED_CLIENTS : state.clients
  const highlightedId = reduced ? null : state.highlightedId

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      {/* Command surface */}
      <div className="overflow-hidden rounded-lg border border-line bg-bg shadow-rest">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Beckon
          </span>
        </div>

        {/* Reserve a stable min height so nothing shifts as content streams in. */}
        <div className="min-h-[208px] space-y-3 p-4 font-mono text-sm leading-relaxed">
          {/* The request the user typed. */}
          <div className="flex gap-2 text-ink">
            <span className="select-none text-ink-faint">{">"}</span>
            <span>
              {typed}
              {typingActive ? <span className="beckon-caret" /> : null}
            </span>
          </div>

          {/* The streamed agent reply. */}
          {showReply ? (
            <div className="flex gap-2 text-ink-muted">
              <span className="select-none text-ink-faint">{"·"}</span>
              <span>
                {replyText}
                {!reduced && state.phase === "streaming" ? <span className="beckon-caret" /> : null}
              </span>
            </div>
          ) : null}

          {/* The confirm step, shown because this is a write. */}
          {showConfirmCard ? (
            <div className="animate-enter-up rounded-md border border-line-strong bg-bg-subtle p-3 motion-reduce:animate-none">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                Confirm to continue
              </p>
              <p className="mt-1.5 text-ink">Create client: Acme</p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-md bg-ink px-2.5 py-1 text-xs text-bg">Confirm</span>
                <span className="rounded-md border border-line px-2.5 py-1 text-xs text-ink-muted">
                  Cancel
                </span>
              </div>
            </div>
          ) : null}

          {/* The confirmed result, with a state colored tick. */}
          {showConfirmed ? (
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
              <span className="text-ink-muted">Created the client Acme.</span>
            </div>
          ) : null}

          {/* A fresh prompt line with the parked caret, ready for the next request. */}
          {promptCaret ? (
            <div className="flex gap-2 text-ink">
              <span className="select-none text-ink-faint">{">"}</span>
              <span className="beckon-caret" />
            </div>
          ) : null}
        </div>
      </div>

      {/* The app the agent acts on. */}
      <MockAppPanel clients={clients} highlightedId={highlightedId} slots={3} />
    </div>
  )
}
