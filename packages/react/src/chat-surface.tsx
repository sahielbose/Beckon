"use client"

import type { BeckonConfig } from "@beckon/client"
import { type FormEvent, useEffect, useRef, useState } from "react"
import { CloseIcon, SendIcon } from "./icons"
import { injectStyles } from "./inject"
import { useBeckon } from "./use-beckon"

export function ChatSurface({
  config,
  title = "Beckon",
  variant = "floating",
  onClose,
  styleRoot,
}: {
  config: BeckonConfig
  title?: string
  variant?: "floating" | "sidebar" | "inline"
  onClose?: () => void
  styleRoot?: Document | ShadowRoot
}) {
  const { items, busy, pendingConfirm, send, resolveConfirm } = useBeckon(config)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    injectStyles(styleRoot ?? document)
  }, [styleRoot])

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new content
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [items, pendingConfirm])

  function submit(event: FormEvent) {
    event.preventDefault()
    const text = input
    setInput("")
    void send(text)
  }

  return (
    <div className={`beckon-panel ${variant}`}>
      <div className="beckon-header">
        <span className="beckon-title">{title}</span>
        {onClose ? (
          <button type="button" className="beckon-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        ) : null}
      </div>

      <div className="beckon-messages" ref={scrollRef}>
        {items.length === 0 ? (
          <div className="beckon-status">Ask me to do something in this app.</div>
        ) : null}
        {items.map((item) =>
          item.kind === "status" ? (
            <div key={item.id} className={`beckon-status${item.error ? " error" : ""}`}>
              {item.text}
            </div>
          ) : (
            <div key={item.id} className={`beckon-msg ${item.kind}`}>
              <span className="role">{item.kind === "user" ? ">" : "·"}</span>
              {item.text || (item.kind === "agent" && busy ? "..." : "")}
            </div>
          ),
        )}
        {pendingConfirm ? (
          <div className="beckon-confirm">
            <div className="label">Confirm to continue</div>
            <div className="summary">{pendingConfirm.req.summary}</div>
            <div className="actions">
              <button
                type="button"
                className="beckon-btn primary"
                onClick={() => resolveConfirm(true)}
              >
                Confirm
              </button>
              <button type="button" className="beckon-btn" onClick={() => resolveConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <form className="beckon-inputbar" onSubmit={submit}>
        <span className="prompt">{">"}</span>
        <input
          className="beckon-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Beckon to do something"
          disabled={busy}
          aria-label="Message"
        />
        <button
          type="submit"
          className="beckon-send"
          disabled={busy || !input.trim()}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  )
}
