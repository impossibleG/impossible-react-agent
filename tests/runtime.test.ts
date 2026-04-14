import pino from "pino";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { createRuntime } from "../src/runtime.js";

describe("createRuntime", () => {
  it("loads built-in tools without external services", async () => {
    const runtime = await createRuntime(loadConfig({}), pino({ level: "silent" }));
    expect(runtime.tools.map((tool) => tool.name)).toEqual(["current_time", "word_count"]);
    await expect(runtime.close()).resolves.toBeUndefined();
  });
});
