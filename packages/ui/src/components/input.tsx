import { type InputHTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/cn"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-line bg-bg px-3 py-1 text-sm text-ink",
        "placeholder:text-ink-faint transition-[color,border-color,box-shadow] duration-standard ease-standard",
        "focus-visible:border-line-strong focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-line-strong",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = "Input"
