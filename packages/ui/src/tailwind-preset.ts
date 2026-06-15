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
      },
      animation: {
        "enter-up": "enter-up 280ms cubic-bezier(0.2,0,0,1)",
        "fade-in": "fade-in 200ms cubic-bezier(0.2,0,0,1)",
      },
    },
  },
  plugins: [animate],
}

export default beckonPreset
