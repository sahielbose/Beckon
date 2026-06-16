// Extract plain text from a URL or an uploaded file. Content extracted here is
// always treated as DATA by the runtime, never as instructions.

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function extractFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": "BeckonBot/1.0 (+https://github.com/sahielbose/Beckon)" },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw new Error(`Could not fetch the URL (status ${response.status}).`)
  }
  const contentType = response.headers.get("content-type") ?? ""
  const body = await response.text()
  return contentType.includes("html") ? htmlToText(body) : body
}

export async function extractFromFile(name: string, buffer: Buffer): Promise<string> {
  const lower = name.toLowerCase()

  if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return buffer.toString("utf8")
  }
  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return htmlToText(buffer.toString("utf8"))
  }
  if (lower.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf")
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    return Array.isArray(text) ? text.join("\n") : text
  }
  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth")
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  }

  // Best effort: treat as UTF-8 text.
  return buffer.toString("utf8")
}
