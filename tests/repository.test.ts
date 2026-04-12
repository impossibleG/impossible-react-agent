import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("repository contract", () => {
  it("explains that ReAct is not the UI framework", async () => {
    const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
    expect(readme).toContain("Reasoning and Acting");
    expect(readme).toContain("not a React user interface");
  });
});
