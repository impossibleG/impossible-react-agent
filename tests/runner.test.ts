import { AIMessage } from "@langchain/core/messages";
import { describe, expect, it, vi } from "vitest";
import type { ImpossibleAgent } from "../src/agent.js";
import { runAgent } from "../src/runner.js";

describe("runAgent", () => {
  it("rejects blank input", async () => {
    const agent = { invoke: vi.fn() } as unknown as ImpossibleAgent;
    await expect(runAgent(agent, { maxSteps: 3, timeoutMs: 100 }, " ")).rejects.toThrow("empty");
  });

  it("normalizes the final response", async () => {
    const invoke = vi.fn().mockResolvedValue({ messages: [new AIMessage("done")] });
    const agent = { invoke } as unknown as ImpossibleAgent;
    const result = await runAgent(agent, { maxSteps: 5, timeoutMs: 1000 }, "go", {
      threadId: "abc",
    });
    expect(result).toMatchObject({ text: "done", threadId: "abc" });
    expect(invoke).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ recursionLimit: 5 }),
    );
  });

  it("converts elapsed deadlines to AgentTimeoutError", async () => {
    const invoke = vi.fn().mockImplementation(
      (_input: unknown, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => {
            reject(new Error("aborted"));
          });
        }),
    );
    const agent = { invoke } as unknown as ImpossibleAgent;
    await expect(runAgent(agent, { maxSteps: 5, timeoutMs: 10 }, "wait")).rejects.toMatchObject({
      name: "AgentTimeoutError",
      timeoutMs: 10,
    });
  });
});
