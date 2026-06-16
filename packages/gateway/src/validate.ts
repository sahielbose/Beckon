import type { JsonSchema } from "@beckon/shared"

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

function checkType(type: string, value: unknown): boolean {
  switch (type) {
    case "string":
      return typeof value === "string"
    case "number":
      return typeof value === "number"
    case "integer":
      return typeof value === "number" && Number.isInteger(value)
    case "boolean":
      return typeof value === "boolean"
    case "array":
      return Array.isArray(value)
    case "object":
      return value !== null && typeof value === "object" && !Array.isArray(value)
    default:
      return true
  }
}

/**
 * Validate concrete arguments against an operation's JSON schema. Strict enough to
 * reject a malformed call before it reaches the host: required fields present, and
 * declared types correct.
 */
export function validateArgs(schema: JsonSchema, args: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  const properties = (schema.properties ?? {}) as Record<string, { type?: string }>
  const required = (Array.isArray(schema.required) ? schema.required : []) as string[]

  for (const field of required) {
    const value = args[field]
    if (value === undefined || value === null || value === "") {
      errors.push(`Missing required field: ${field}`)
    }
  }

  for (const [key, value] of Object.entries(args)) {
    const def = properties[key]
    if (!def?.type) continue
    if (value === undefined || value === null) continue
    if (!checkType(def.type, value)) {
      errors.push(`Field ${key} should be a ${def.type}`)
    }
  }

  return { ok: errors.length === 0, errors }
}
