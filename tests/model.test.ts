import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { createModel } from "../src/model.js";

describe("createModel", () => {
  it("builds an OpenAI-compatible local client", () => {
    const model = createModel(loadConfig({}));
    expect(model.model).toBe("qwen3:8b");
    expect(model.temperature).toBe(0);
  });
});
