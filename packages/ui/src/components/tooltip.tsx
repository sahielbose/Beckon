"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react"
import { cn } from "../lib/cn"

export const TooltipProvider = TooltipPrimitive.Provider

export const Tooltip = TooltipPrimitive.Root

export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-ink px-2 py-1 text-xs text-bg shadow-hover animate-fade-in",
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"
