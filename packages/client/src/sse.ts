import { type StreamEvent, streamEvent } from "@beckon/shared"

/** Parse a server sent event stream into validated StreamEvent objects. Events
 *  that fail validation are dropped, since the widget treats them as data. */
export async function* readSSE(body: ReadableStream<Uint8Array>): AsyncIterable<StreamEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let boundary = buffer.indexOf("\n\n")
    while (boundary >= 0) {
      const chunk = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      const dataLine = chunk.split("\n").find((line) => line.startsWith("data:"))
      if (dataLine) {
        const json = dataLine.slice(5).trim()
        if (json) {
          try {
            const parsed = streamEvent.safeParse(JSON.parse(json))
            if (parsed.success) yield parsed.data
          } catch {
            // Ignore malformed event frames.
          }
        }
      }
      boundary = buffer.indexOf("\n\n")
    }
  }
}
