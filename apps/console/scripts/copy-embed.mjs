// Copy the built embed bundle into the console's public folder so it is served at
// /embed.js. The embed package is built first via the turbo build dependency.
import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const source = join(here, "../../../packages/embed/dist/embed.js")
const destDir = join(here, "../public")
const dest = join(destDir, "embed.js")

if (!existsSync(source)) {
  console.warn(
    "[copy-embed] embed.js is not built yet; skipping. Run pnpm --filter @beckon/embed build",
  )
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
copyFileSync(source, dest)
console.log("[copy-embed] copied embed.js into public/")
