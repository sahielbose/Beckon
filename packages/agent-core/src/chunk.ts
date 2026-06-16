export interface Chunk {
  content: string
  index: number
}

export interface ChunkOptions {
  /** Target characters per chunk. */
  size?: number
  /** Characters of overlap carried into the next chunk. */
  overlap?: number
}

/**
 * Split text into overlapping chunks, breaking on paragraph and sentence
 * boundaries where possible so a chunk is a coherent passage.
 */
export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  const size = options.size ?? 1200
  const overlap = options.overlap ?? 200
  const clean = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim()
  if (!clean) return []

  // Split into paragraphs, then pack paragraphs up to the size budget.
  const paragraphs = clean
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
  const chunks: Chunk[] = []
  let buffer = ""

  const flush = () => {
    const content = buffer.trim()
    if (content) chunks.push({ content, index: chunks.length })
  }

  for (const para of paragraphs) {
    if (para.length > size) {
      // A long paragraph: slide a window over it.
      flush()
      buffer = ""
      for (let start = 0; start < para.length; start += size - overlap) {
        const slice = para.slice(start, start + size)
        chunks.push({ content: slice.trim(), index: chunks.length })
        if (start + size >= para.length) break
      }
      continue
    }
    if (`${buffer}\n\n${para}`.length > size) {
      flush()
      // Carry an overlap tail into the next buffer.
      buffer = buffer.length > overlap ? buffer.slice(buffer.length - overlap) : ""
      buffer = buffer ? `${buffer}\n\n${para}` : para
    } else {
      buffer = buffer ? `${buffer}\n\n${para}` : para
    }
  }
  flush()
  return chunks
}
