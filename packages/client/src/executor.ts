import type { ClientActionRequest } from "@beckon/shared"
import type { ClientToolSpec } from "./types"

/** Set an input's value so frameworks like React notice the change. */
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, "value")?.set
  setter?.call(element, value)
  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

/**
 * Run a UI action or a host function in the page. Selectors and host functions are
 * provided by the operator. Throws a clear error when a target cannot be resolved.
 */
export async function executeAction(
  name: string,
  action: ClientActionRequest,
  tools: Record<string, ClientToolSpec>,
): Promise<unknown> {
  switch (action.actionType) {
    case "navigate": {
      if (!action.url) throw new Error("No destination was given.")
      window.location.assign(action.url)
      return { navigated: action.url }
    }
    case "click": {
      const el = action.target ? document.querySelector<HTMLElement>(action.target) : null
      if (!el) throw new Error(`Could not find anything to click for ${action.target}.`)
      el.click()
      return { clicked: action.target }
    }
    case "fill": {
      const el = action.target
        ? document.querySelector<HTMLInputElement | HTMLTextAreaElement>(action.target)
        : null
      if (!el) throw new Error(`Could not find a field for ${action.target}.`)
      setNativeValue(el, action.value ?? "")
      return { filled: action.target }
    }
    default: {
      const tool = tools[name]
      if (!tool) throw new Error(`No host function named ${name} is registered.`)
      return await tool.handler(action.params ?? {})
    }
  }
}
