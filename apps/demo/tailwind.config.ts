import { beckonPreset } from "@beckon/ui/preset"
import type { Config } from "tailwindcss"

export default {
  presets: [beckonPreset as Config],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
} satisfies Config
