import { type JsonSchema, isWriteMethod } from "@beckon/shared"
import { parse as parseYaml } from "yaml"

export interface OperationParam {
  name: string
  in: "path" | "query" | "header"
  required: boolean
  schema: JsonSchema
}

export interface ParsedOperation {
  operationId: string
  method: string
  path: string
  summary: string
  description: string
  params: OperationParam[]
  bodyProps: string[]
  bodyRequired: string[]
  parametersSchema: JsonSchema
  sideEffect: boolean
}

export interface ParsedSpec {
  baseUrl: string
  title: string
  operations: ParsedOperation[]
}

const METHODS = ["get", "post", "put", "patch", "delete", "head", "options"]

type AnyObj = Record<string, unknown>

function asObj(value: unknown): AnyObj | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AnyObj) : undefined
}

function deref(spec: AnyObj, ref: string): unknown {
  if (!ref.startsWith("#/")) return undefined
  const parts = ref
    .slice(2)
    .split("/")
    .map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"))
  let cur: unknown = spec
  for (const p of parts) {
    const obj = asObj(cur)
    if (!obj) return undefined
    cur = obj[p]
  }
  return cur
}

function resolve(spec: AnyObj, node: unknown, seen = new Set<string>()): AnyObj | undefined {
  const obj = asObj(node)
  if (!obj) return undefined
  if (typeof obj.$ref === "string") {
    if (seen.has(obj.$ref)) return {}
    seen.add(obj.$ref)
    return resolve(spec, deref(spec, obj.$ref), seen)
  }
  return obj
}

function sanitizeName(id: string): string {
  return (
    id
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "operation"
  )
}

export function parseSpecText(text: string): AnyObj {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const parsed = parseYaml(trimmed)
    if (!parsed || typeof parsed !== "object") {
      throw new Error("This does not look like a valid OpenAPI spec.")
    }
    return parsed as AnyObj
  }
}

export function parseOpenApi(input: string | AnyObj): ParsedSpec {
  const spec = typeof input === "string" ? parseSpecText(input) : input
  if (!asObj(spec)) throw new Error("This does not look like an OpenAPI spec.")

  const servers = Array.isArray(spec.servers) ? (spec.servers as AnyObj[]) : []
  const baseUrl = typeof servers[0]?.url === "string" ? (servers[0].url as string) : ""
  const info = asObj(spec.info)
  const title = typeof info?.title === "string" ? info.title : "Imported API"
  const paths = asObj(spec.paths) ?? {}

  const operations: ParsedOperation[] = []

  for (const [path, pathItemRaw] of Object.entries(paths)) {
    const pathItem = resolve(spec, pathItemRaw)
    if (!pathItem) continue
    const pathLevelParams = Array.isArray(pathItem.parameters)
      ? (pathItem.parameters as unknown[]).map((p) => resolve(spec, p)).filter(Boolean)
      : []

    for (const method of METHODS) {
      const op = resolve(spec, pathItem[method])
      if (!op) continue

      const opParams = [
        ...pathLevelParams,
        ...(Array.isArray(op.parameters)
          ? (op.parameters as unknown[]).map((p) => resolve(spec, p)).filter(Boolean)
          : []),
      ] as AnyObj[]

      const params: OperationParam[] = opParams
        .filter((p) => p.in === "path" || p.in === "query" || p.in === "header")
        .map((p) => ({
          name: String(p.name),
          in: p.in as OperationParam["in"],
          required: Boolean(p.required) || p.in === "path",
          schema: (resolve(spec, p.schema) as JsonSchema) ?? { type: "string" },
        }))

      let bodyProps: string[] = []
      let bodyRequired: string[] = []
      const bodyProperties: Record<string, JsonSchema> = {}
      const requestBody = resolve(spec, op.requestBody)
      const content = asObj(requestBody?.content)
      if (content) {
        const media = asObj(content["application/json"]) ?? asObj(Object.values(content)[0])
        const bodySchema = resolve(spec, media?.schema)
        const properties = asObj(bodySchema?.properties)
        if (properties) {
          for (const [k, v] of Object.entries(properties)) {
            bodyProperties[k] = (resolve(spec, v) as JsonSchema) ?? { type: "string" }
          }
          bodyProps = Object.keys(bodyProperties)
          bodyRequired = Array.isArray(bodySchema?.required)
            ? (bodySchema.required as string[])
            : []
        }
      }

      const properties: Record<string, JsonSchema> = {}
      const required: string[] = []
      for (const p of params) {
        properties[p.name] = p.schema
        if (p.required) required.push(p.name)
      }
      for (const [k, v] of Object.entries(bodyProperties)) properties[k] = v
      for (const r of bodyRequired) if (!required.includes(r)) required.push(r)

      operations.push({
        operationId: sanitizeName(
          typeof op.operationId === "string" ? op.operationId : `${method}_${path}`,
        ),
        method: method.toUpperCase(),
        path,
        summary: typeof op.summary === "string" ? op.summary : "",
        description:
          typeof op.description === "string"
            ? op.description
            : typeof op.summary === "string"
              ? op.summary
              : `${method.toUpperCase()} ${path}`,
        params,
        bodyProps,
        bodyRequired,
        parametersSchema: {
          type: "object",
          properties,
          ...(required.length > 0 ? { required } : {}),
        },
        sideEffect: isWriteMethod(method),
      })
    }
  }

  return { baseUrl, title, operations }
}
