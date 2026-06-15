import { type VariantProps, cva } from "class-variance-authority"
import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-line bg-bg-subtle text-ink",
        muted: "border-line bg-bg text-ink-muted",
        success: "border-transparent bg-success-subtle text-success",
        danger: "border-transparent bg-danger-subtle text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
