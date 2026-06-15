"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { cn } from "../lib/cn"

export function CopyButton({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy"}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors duration-micro ease-standard hover:bg-bg-subtle hover:text-ink",
        className,
      )}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
    </button>
  )
}
