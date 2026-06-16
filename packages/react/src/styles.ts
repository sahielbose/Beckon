// Self contained styles for the widget. Scoped under .beckon-root so they neither
// leak into the host page nor pick up the host page's styles. Injected once into
// the document head (or into the shadow root by the embed).

export const WIDGET_STYLES = `
.beckon-root {
  --bg: #ffffff;
  --bg-subtle: #fafafa;
  --ink: #0a0a0a;
  --ink-muted: #5c5c5c;
  --ink-faint: #8a8a8a;
  --line: #e6e6e6;
  --line-strong: #d4d4d4;
  --danger: #c0362c;
  --success: #1e7a46;
  --ease: cubic-bezier(0.2, 0, 0, 1);
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--ink);
  box-sizing: border-box;
}
.beckon-root *, .beckon-root *::before, .beckon-root *::after { box-sizing: border-box; }

.beckon-bubble {
  position: fixed; bottom: 20px; right: 20px; z-index: 2147483000;
  height: 48px; width: 48px; border-radius: 9999px;
  background: var(--ink); color: var(--bg);
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: transform 120ms var(--ease);
}
.beckon-bubble:hover { transform: translateY(-1px); }
.beckon-bubble svg { height: 20px; width: 20px; }

.beckon-panel {
  display: flex; flex-direction: column; background: var(--bg);
  border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
}
.beckon-panel.floating {
  position: fixed; bottom: 20px; right: 20px; z-index: 2147483000;
  width: 380px; max-width: calc(100vw - 40px); height: 560px; max-height: calc(100vh - 40px);
}
.beckon-panel.sidebar { height: 100%; width: 100%; border-radius: 0; border: none; border-left: 1px solid var(--line); }

.beckon-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid var(--line);
}
.beckon-title { font-size: 13px; font-weight: 600; }
.beckon-close { background: none; border: none; cursor: pointer; color: var(--ink-muted); padding: 4px; line-height: 0; }
.beckon-close:hover { color: var(--ink); }

.beckon-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.beckon-msg { font-size: 14px; line-height: 1.55; white-space: pre-wrap; }
.beckon-msg.user { color: var(--ink); }
.beckon-msg.agent { color: var(--ink-muted); }
.beckon-msg .role { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; color: var(--ink-faint); margin-right: 8px; user-select: none; }
.beckon-status { font-size: 12px; color: var(--ink-faint); font-family: ui-monospace, Menlo, monospace; }
.beckon-status.error { color: var(--danger); }

.beckon-confirm { border: 1px solid var(--line-strong); border-radius: 8px; background: var(--bg-subtle); padding: 12px; }
.beckon-confirm .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-faint); }
.beckon-confirm .summary { font-size: 14px; margin-top: 4px; color: var(--ink); }
.beckon-confirm .actions { display: flex; gap: 8px; margin-top: 10px; }
.beckon-btn { font-size: 13px; border-radius: 6px; padding: 6px 12px; cursor: pointer; border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
.beckon-btn.primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.beckon-btn:disabled { opacity: 0.5; cursor: default; }

.beckon-inputbar { border-top: 1px solid var(--line); padding: 10px 12px; display: flex; gap: 8px; align-items: center; }
.beckon-inputbar .prompt { font-family: ui-monospace, Menlo, monospace; color: var(--ink-faint); }
.beckon-input {
  flex: 1; border: none; outline: none; background: none; font-size: 14px; color: var(--ink);
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
}
.beckon-input::placeholder { color: var(--ink-faint); }
.beckon-send { background: none; border: none; cursor: pointer; color: var(--ink); padding: 4px; line-height: 0; }
.beckon-send:disabled { color: var(--ink-faint); cursor: default; }

@media (prefers-reduced-motion: reduce) {
  .beckon-bubble { transition: none; }
}
`
