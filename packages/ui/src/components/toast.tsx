"use client"

import { Toaster as SonnerToaster } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
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
