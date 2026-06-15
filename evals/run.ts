import { readdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import type { EvalCase, EvalOutcome } from "./types"

const here = dirname(fileURLToPath(import.meta.url))
const casesDir = join(here, "cases")

async function findCaseFiles(dir: string): Promise<string[]> {
  let entries: Awaited<ReturnType<typeof readdir>>
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await findCaseFiles(full)))
    } else if (entry.name.endsWith(".cases.ts")) {
      files.push(full)
    }
  }
  return files
}

async function loadCases(): Promise<EvalCase[]> {
  const files = await findCaseFiles(casesDir)
  const all: EvalCase[] = []
  for (const file of files.sort()) {
    const mod = (await import(pathToFileURL(file).href)) as {
      cases?: EvalCase[]
      default?: EvalCase[]
    }
    const cases = mod.cases ?? mod.default
    if (Array.isArray(cases)) all.push(...cases)
  }
  return all
}

async function runCase(c: EvalCase): Promise<EvalOutcome> {
  try {
    return await c.run()
  } catch (error) {
    return { pass: false, detail: error instanceof Error ? error.message : String(error) }
  }
}

async function main() {
  const filter = process.argv[2]
  let cases = await loadCases()
  if (filter) {
    cases = cases.filter((c) => c.category === filter || c.id.includes(filter))
  }

  if (cases.length === 0) {
    console.log(filter ? `No eval cases match "${filter}".` : "No eval cases registered yet.")
    return
  }

  const byCategory = new Map<string, EvalCase[]>()
  for (const c of cases) {
    const list = byCategory.get(c.category) ?? []
    list.push(c)
    byCategory.set(c.category, list)
  }

  let passed = 0
  let failed = 0
  for (const [category, list] of [...byCategory.entries()].sort()) {
    console.log(`\n${category}`)
    for (const c of list.sort((a, b) => a.id.localeCompare(b.id))) {
      const outcome = await runCase(c)
      if (outcome.pass) {
        passed++
        console.log(`  pass  ${c.id}`)
      } else {
        failed++
        console.log(`  FAIL  ${c.id}${outcome.detail ? `  (${outcome.detail})` : ""}`)
      }
    }
  }

  console.log(`\n${passed} passed, ${failed} failed, ${cases.length} total`)
  if (failed > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
