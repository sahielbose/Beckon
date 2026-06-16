"use client"

import { Toaster as SonnerToaster } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

export function Toaster(props: ToasterProps) {
  // The palette is light only. Sonner handles its own quiet enter and exit and
  // honors prefers-reduced-motion natively, so we keep styling restrained and do
  // not override its motion. Callers can still pass props through.
  return (
    <SonnerToaster
      theme="light"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-md border border-line bg-bg text-ink shadow-hover",
          description: "text-ink-muted",
          actionButton: "bg-ink text-bg",
          cancelButton: "bg-bg-subtle text-ink",
        },
      }}
      {...props}
    />
  )
}

export { toast } from "sonner"
