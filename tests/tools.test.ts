import { describe, expect, it } from "vitest";
import { createBuiltinTools } from "../src/tools.js";

describe("built-in tools", () => {
  const tools = createBuiltinTools();

  it("exposes stable tool names", () => {
    expect(tools.map((tool) => tool.name)).toEqual(["current_time", "word_count"]);
  });

  it("counts words and characters", async () => {
    const wordCount = tools.find((tool) => tool.name === "word_count");
    await expect(wordCount?.invoke({ text: "one two" })).resolves.toEqual({
      words: 2,
      characters: 7,
    });
    await expect(wordCount?.invoke({ text: "" })).resolves.toEqual({ words: 0, characters: 0 });
  });

  it("returns ISO time", async () => {
    const currentTime = tools.find((tool) => tool.name === "current_time");
    const result: unknown = await currentTime?.invoke({});
    expect(() => new Date(String(result)).toISOString()).not.toThrow();
  });
});
