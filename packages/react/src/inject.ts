import { WIDGET_STYLES } from "./styles"

/** Inject the widget stylesheet once into a document or a shadow root. */
export function injectStyles(root: Document | ShadowRoot = document) {
  if (typeof document === "undefined") return
  const id = "beckon-styles"
  const exists = root instanceof Document ? root.getElementById(id) : root.querySelector(`#${id}`)
  if (exists) return
  const style = document.createElement("style")
  style.id = id
  style.textContent = WIDGET_STYLES
  ;(root instanceof Document ? root.head : root).appendChild(style)
}
