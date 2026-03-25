import { AIMessage } from "@langchain/core/messages";
import pino from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ImpossibleAgent } from "../src/agent.js";
import { loadConfig } from "../src/config.js";
import { startHttp, type HttpRuntime } from "../src/http.js";

describe("agent HTTP API", () => {
  let runtime: HttpRuntime | undefined;
  afterEach(async () => runtime?.close());

  function fakeAgent(): ImpossibleAgent {
    return {
      invoke: vi.fn().mockResolvedValue({ messages: [new AIMessage("local answer")] }),
    } as unknown as ImpossibleAgent;
  }

  it("reports health and readiness", async () => {
    const config = loadConfig({ AGENT_PORT: "41417", AGENT_LOG_LEVEL: "silent" });
    runtime = await startHttp(config, fakeAgent(), pino({ level: "silent" }));
    const health = await fetch("http://127.0.0.1:41417/healthz");
    const ready = await fetch("http://127.0.0.1:41417/readyz");
    await expect(health.json()).resolves.toEqual({ status: "ok" });
    await expect(ready.json()).resolves.toEqual({ status: "ready" });
  });

  it("runs a chat request", async () => {
    const config = loadConfig({ AGENT_PORT: "41418", AGENT_LOG_LEVEL: "silent" });
    runtime = await startHttp(config, fakeAgent(), pino({ level: "silent" }));
    const response = await fetch("http://127.0.0.1:41418/v1/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "hello", threadId: "http-thread" }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      output: "local answer",
      threadId: "http-thread",
    });
  });

  it("rejects missing routes and invalid input", async () => {
    const config = loadConfig({ AGENT_PORT: "41419", AGENT_LOG_LEVEL: "silent" });
    runtime = await startHttp(config, fakeAgent(), pino({ level: "silent" }));
    expect((await fetch("http://127.0.0.1:41419/missing")).status).toBe(404);
    const invalid = await fetch("http://127.0.0.1:41419/v1/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "" }),
    });
    expect(invalid.status).toBe(400);
  });
});
