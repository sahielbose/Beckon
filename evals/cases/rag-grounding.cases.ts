import { type SourceChunk, StubEmbedder, inMemoryRetriever } from "@beckon/agent-core"
import { runTurnCollect, textOf } from "../support/agent"
import { check, defineCases } from "../types"

const SOURCES: SourceChunk[] = [
  {
    sourceId: "src_refunds",
    sourceName: "Refund policy",
    content: "Our refund window for annual plans is 30 days from the purchase date.",
  },
  {
    sourceId: "src_hours",
    sourceName: "Support hours",
    content: "Support is available Monday to Friday, from 9am to 5pm Pacific time.",
  },
]

export const cases = defineCases("rag-grounding", [
  {
    id: "rag-grounding/cites-the-correct-source",
    description: "A grounded question cites the source that supports it",
    run: async () => {
      const retrieve = inMemoryRetriever(SOURCES, new StubEmbedder(), 2)
      const { events } = await runTurnCollect({
        userMessage: "What is the refund window for annual plans?",
        tools: [],
        retrieve,
      })
      const citation = events.find((e) => e.type === "citation")
      if (!citation || citation.type !== "citation")
        return { pass: false, detail: "no citation emitted" }
      if (citation.sourceId !== "src_refunds") {
        return { pass: false, detail: `cited ${citation.sourceId}` }
      }
      const text = textOf(events)
      return check(text.includes("Refund policy"), `answer did not cite the source: ${text}`)
    },
  },
  {
    id: "rag-grounding/snippet-is-grounded-in-the-source",
    description: "The answer quotes content that is actually in the source",
    run: async () => {
      const retrieve = inMemoryRetriever(SOURCES, new StubEmbedder(), 2)
      const { events } = await runTurnCollect({
        userMessage: "How long is the refund window for annual plans?",
        tools: [],
        retrieve,
      })
      const text = textOf(events)
      const source = SOURCES[0].content
      // Every cited sentence must be a real substring of the source (no invention).
      const quoted = text.split(": ").slice(1).join(": ").trim()
      return check(
        quoted.length > 0 && source.includes(quoted),
        `quoted text not found verbatim in source: ${quoted}`,
      )
    },
  },
  {
    id: "rag-grounding/no-citation-when-unsupported",
    description: "An unrelated question does not invent a citation",
    run: async () => {
      const retrieve = inMemoryRetriever(SOURCES, new StubEmbedder(), 2)
      const { events } = await runTurnCollect({
        userMessage: "xylophone telescope quasar",
        tools: [],
        retrieve,
      })
      const citation = events.find((e) => e.type === "citation")
      const text = textOf(events)
      return check(
        !citation && !text.includes("Based on"),
        "invented a citation for an unrelated query",
      )
    },
  },
])
