import { describe, expect, it } from "vitest"
import { isToolAllowed } from "./guardrails"
import { newId } from "./ids"
import { REDACTED, redactHeaders, redactSecrets } from "./redact"

describe("redactSecrets", () => {
  it("redacts secret keys at any depth", () => {
    const input = {
      name: "ok",
      authorization: "Bearer abc",
      nested: { apiKey: "sk-123", value: 1, password: "hunter2" },
      list: [{ token: "t" }, { safe: "keep" }],
    }
    const out = redactSecrets(input) as typeof input
    expect(out.name).toBe("ok")
    expect(out.authorization).toBe(REDACTED)
    expect(out.nested.apiKey).toBe(REDACTED)
    expect(out.nested.value).toBe(1)
    expect(out.nested.password).toBe(REDACTED)
    expect(out.list[0].token).toBe(REDACTED)
    expect(out.list[1].safe).toBe("keep")
  })

  it("handles cycles without throwing", () => {
    const a: Record<string, unknown> = { name: "a" }
    a.self = a
    expect(() => redactSecrets(a)).not.toThrow()
  })

  it("redacts headers case insensitively", () => {
    const headers = { Authorization: "Bearer x", "Content-Type": "application/json" }
    const out = redactHeaders(headers)
    expect(out.Authorization).toBe(REDACTED)
    expect(out["Content-Type"]).toBe("application/json")
  })
})

describe("isToolAllowed", () => {
  const base = { allowedTools: [], blockedTools: [], confirmOnWrite: true, scopes: [] }

  it("allows everything when no lists are set", () => {
    expect(isToolAllowed(base, "anything")).toBe(true)
  })

  it("never allows a blocked tool, even if allow listed", () => {
    expect(
      isToolAllowed(
        { ...base, allowedTools: ["deleteAccount"], blockedTools: ["deleteAccount"] },
        "deleteAccount",
      ),
    ).toBe(false)
  })

  it("restricts to the allow list when one is present", () => {
    expect(isToolAllowed({ ...base, allowedTools: ["search"] }, "search")).toBe(true)
    expect(isToolAllowed({ ...base, allowedTools: ["search"] }, "charge")).toBe(false)
  })
})

describe("newId", () => {
  it("produces prefixed, unique ids", () => {
    const a = newId("agent")
    const b = newId("agent")
    expect(a.startsWith("agt_")).toBe(true)
    expect(a).not.toBe(b)
  })
})
