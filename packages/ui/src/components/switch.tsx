"use client"

import * as SwitchPrimitive from "@radix-ui/react-switch"
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react"
import { cn } from "../lib/cn"

export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex h-5 w-9 items-center rounded-full border border-transparent bg-line transition-colors duration-micro ease-standard data-[state=checked]:bg-ink focus-visible:outline-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block h-4 w-4 rounded-full bg-bg shadow-rest transition-transform duration-micro ease-standard translate-x-0.5 data-[state=checked]:translate-x-4" />
  </SwitchPrimitive.Root>
))
Switch.displayName = "Switch"
