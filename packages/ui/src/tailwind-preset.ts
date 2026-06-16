import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

// Shared Tailwind theme. Apps add it to `presets` and supply their own `content`.
// Colors map to CSS variables (see tokens.css) so theming lives in one place.
export const beckonPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-subtle": "var(--bg-subtle)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-faint": "var(--ink-faint)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        danger: "var(--danger)",
        "danger-subtle": "var(--danger-subtle)",
        success: "var(--success)",
        "success-subtle": "var(--success-subtle)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        rest: "var(--shadow-rest)",
        hover: "var(--shadow-hover)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        content: "1120px",
      },
      backgroundImage: {
        // Faint structural grid built from the line color, very low contrast.
        // Use the `bg-grid` class. Defaults to a 32px cell via `bg-grid-cell`,
        // or pair with any `bg-[length:...]` for a different size.
        grid: "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
        // Soft, barely there radial light from near white to white.
        // Use the `bg-spotlight` class.
        spotlight: "radial-gradient(60% 50% at 50% 0%, var(--bg-subtle) 0%, var(--bg) 70%)",
      },
      backgroundSize: {
        // Default cell size for `bg-grid`. Named to avoid colliding with the
        // `bg-grid` image utility above.
        "grid-cell": "32px 32px",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
      transitionDuration: {
        micro: "120ms",
        standard: "200ms",
        entrance: "280ms",
      },
      keyframes: {
        "enter-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        // Quiet downward fade for overlay content on close. Mirrors enter-up.
        "exit-down": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(6px)" },
        },
        // Side panel slides, paired with the standard easing below.
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        // Calm left to right sweep for loading skeletons.
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "enter-up": "enter-up 280ms cubic-bezier(0.2,0,0,1)",
        "fade-in": "fade-in 200ms cubic-bezier(0.2,0,0,1)",
        "fade-out": "fade-out 200ms cubic-bezier(0.2,0,0,1)",
        "exit-down": "exit-down 200ms cubic-bezier(0.2,0,0,1)",
        "slide-in-right": "slide-in-right 280ms cubic-bezier(0.2,0,0,1)",
        "slide-out-right": "slide-out-right 200ms cubic-bezier(0.2,0,0,1)",
        "slide-in-left": "slide-in-left 280ms cubic-bezier(0.2,0,0,1)",
        "slide-out-left": "slide-out-left 200ms cubic-bezier(0.2,0,0,1)",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [animate],
}

export default beckonPreset
