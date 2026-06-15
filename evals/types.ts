// Golden case contract. Every feature section adds its own cases as files named
// `*.cases.ts` under `evals/cases`, each exporting a `cases` array. The runner
// discovers them, runs each case, and fails the build on any red case.

export type EvalCategory =
  | "tool-plan"
  | "confirmation"
  | "rag-grounding"
  | "openapi-mapping"
  | "gateway-guard"
  | "flow-adherence"
  | "guardrails"
  | "client-actions"
  | "injection"

export interface EvalOutcome {
  pass: boolean
  /** Short explanation shown on failure, and optionally on pass. */
  detail?: string
}

export interface EvalCase {
  id: string
  category: EvalCategory
  description?: string
  /** Run the case and report whether it passed. Throwing counts as a failure. */
  run: () => Promise<EvalOutcome> | EvalOutcome
}

/** Helper to build a typed list of cases with a shared category. */
export function defineCases(
  category: EvalCategory,
  cases: Omit<EvalCase, "category">[],
): EvalCase[] {
  return cases.map((c) => ({ ...c, category }))
}

/** Assertion helper: pass when the condition holds, otherwise fail with detail. */
export function check(condition: boolean, detail: string): EvalOutcome {
  return condition ? { pass: true } : { pass: false, detail }
}
