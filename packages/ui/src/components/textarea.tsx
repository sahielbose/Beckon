import { type TextareaHTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/cn"

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink",
        "placeholder:text-ink-faint transition-[color,border-color,box-shadow] duration-standard ease-standard",
        "focus-visible:border-line-strong focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = "Textarea"
