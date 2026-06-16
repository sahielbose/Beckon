import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn"

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Calm left to right shimmer over a subtle band, staying in palette.
        // Reduced motion stops the sweep and leaves a flat subtle surface.
        "rounded-md bg-bg-subtle bg-[length:200%_100%] bg-gradient-to-r from-bg-subtle via-line to-bg-subtle animate-shimmer",
        className,
      )}
      {...props}
    />
  )
}
