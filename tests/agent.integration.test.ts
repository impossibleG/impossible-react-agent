import { FakeToolCallingModel } from "langchain";
import { describe, expect, it } from "vitest";
import { buildAgent } from "../src/agent.js";
import { loadConfig } from "../src/config.js";
import { runAgent } from "../src/runner.js";
import { createBuiltinTools } from "../src/tools.js";

describe("ReAct agent", () => {
  it("completes a model-only turn", async () => {
    const config = loadConfig({ AGENT_TIMEOUT_MS: "5000" });
    const agent = buildAgent(config, {
      tools: createBuiltinTools(),
      model: new FakeToolCallingModel(),
    });
    const result = await runAgent(agent, config, "hello", { threadId: "test-thread" });
    expect(result.threadId).toBe("test-thread");
    expect(result.messages.length).toBeGreaterThan(1);
    expect(result.text).toBeTypeOf("string");
  });

  it("executes a tool call before answering", async () => {
    const config = loadConfig({ AGENT_TIMEOUT_MS: "5000" });
    const model = new FakeToolCallingModel({
      toolCalls: [[{ name: "word_count", args: { text: "one two three" }, id: "call-1" }], []],
    });
    const agent = buildAgent(config, { tools: createBuiltinTools(), model });
    const result = await runAgent(agent, config, "count this", { threadId: "tool-thread" });
    expect(result.messages.some((message) => message.type === "tool")).toBe(true);
  });
});
