# Evals

Golden cases that gate every change. Run with `pnpm eval` from the repo root.

## How it works

- Cases live in `evals/cases`, in files named `*.cases.ts`.
- Each file exports a `cases` array of `EvalCase` (see `types.ts`).
- The runner discovers every `*.cases.ts` file, runs each case, prints pass or
  fail per case, and exits non zero if any case fails.
- Filter a run with `pnpm eval <category-or-id-substring>`, for example
  `pnpm eval guardrails`.

## Categories

`tool-plan`, `confirmation`, `rag-grounding`, `openapi-mapping`, `gateway-guard`,
`flow-adherence`, `guardrails`, `client-actions`, `injection`.

A failing eval is a failing build. Add cases in the same section that adds the
feature. Section 14 consolidates the suite behind a CI gate.

## Writing a case

```ts
import { check, defineCases } from "../../types"

export const cases = defineCases("tool-plan", [
  {
    id: "tool-plan/picks-search",
    description: "A search request selects the search tool",
    run: () => check(true, "expected the search tool to be chosen"),
  },
])
```
