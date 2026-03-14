import { tool, type StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export function createBuiltinTools(): StructuredTool[] {
  const currentTime = tool(() => new Date().toISOString(), {
    name: "current_time",
    description: "Read the current server time as an ISO-8601 value.",
    schema: z.object({}),
  });

  const wordCount = tool(
    ({ text }: { text: string }) => ({
      words: text.trim() ? text.trim().split(/\s+/u).length : 0,
      characters: text.length,
    }),
    {
      name: "word_count",
      description: "Count the words and characters in text.",
      schema: z.object({ text: z.string().max(100_000) }),
    },
  );

  return [currentTime, wordCount];
}
