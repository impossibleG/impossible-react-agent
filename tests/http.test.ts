import { AIMessage, AIMessageChunk } from "@langchain/core/messages";
import { request } from "node:http";
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

  it("streams server-sent events", async () => {
    const config = loadConfig({ AGENT_PORT: "41420", AGENT_LOG_LEVEL: "silent" });
    const agent = fakeAgent();
    agent.streamEvents = vi.fn().mockImplementation(async function* () {
      await Promise.resolve();
      yield {
        event: "on_chat_model_stream",
        data: { chunk: new AIMessageChunk("hello") },
      };
    }) as typeof agent.streamEvents;
    runtime = await startHttp(config, agent, pino({ level: "silent" }));
    const response = await fetch("http://127.0.0.1:41420/v1/chat/stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "hello", threadId: "stream-thread" }),
    });
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const body = await response.text();
    expect(body).toContain("event: text");
    expect(body).toContain('"text":"hello"');
    expect(body).toContain("event: done");
  });

  it("cancels the agent run when the client disconnects", async () => {
    const config = loadConfig({ AGENT_PORT: "41421", AGENT_LOG_LEVEL: "silent" });
    let signal: AbortSignal | undefined;
    let markStarted: () => void = () => undefined;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const agent = {
      invoke: vi.fn().mockImplementation((_input: unknown, options: { signal: AbortSignal }) => {
        signal = options.signal;
        markStarted();
        return new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => {
            reject(new Error("aborted"));
          });
        });
      }),
    } as unknown as ImpossibleAgent;
    runtime = await startHttp(config, agent, pino({ level: "silent" }));
    const client = request({ host: "127.0.0.1", port: 41421, path: "/v1/chat", method: "POST" });
    client.on("error", () => undefined);
    client.end(JSON.stringify({ input: "wait" }));
    await started;
    client.destroy();
    await vi.waitFor(() => {
      expect(signal?.aborted).toBe(true);
    });
  });

  it("answers malformed, blank, and oversized requests with client errors", async () => {
    const config = loadConfig({ AGENT_PORT: "41422", AGENT_LOG_LEVEL: "silent" });
    const invoke = vi.fn();
    runtime = await startHttp(
      config,
      { invoke } as unknown as ImpossibleAgent,
      pino({ level: "silent" }),
    );
    const post = (path: string, body: string) =>
      fetch(`http://127.0.0.1:41422${path}`, { method: "POST", body });
    for (const path of ["/v1/chat", "/v1/chat/stream"]) {
      expect((await post(path, "{not json")).status).toBe(400);
      expect((await post(path, JSON.stringify({ input: "   " }))).status).toBe(400);
      expect((await post(path, JSON.stringify({ input: "x".repeat(1_000_001) }))).status).toBe(413);
    }
    expect(invoke).not.toHaveBeenCalled();
  });
});
