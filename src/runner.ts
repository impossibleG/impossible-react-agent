import { randomUUID } from "node:crypto";
import { AIMessageChunk, type BaseMessage } from "@langchain/core/messages";
import type { AgentConfig } from "./config.js";
import { AgentTimeoutError } from "./errors.js";
import { finalMessageText, messageText } from "./messages.js";
import type { ImpossibleAgent } from "./agent.js";

export type RunOptions = { threadId?: string; signal?: AbortSignal };
export type RunResult = { text: string; messages: BaseMessage[]; threadId: string };
export type StreamChunk = { type: "text"; text: string } | { type: "done"; threadId: string };

export async function runAgent(
  agent: ImpossibleAgent,
  config: Pick<AgentConfig, "maxSteps" | "timeoutMs">,
  input: string,
  options: RunOptions = {},
): Promise<RunResult> {
  if (!input.trim()) throw new Error("Input must not be empty");
  const threadId = options.threadId ?? randomUUID();
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => {
    timeoutController.abort();
  }, config.timeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const result = await agent.invoke(
      { messages: [{ role: "user", content: input }] },
      { configurable: { thread_id: threadId }, recursionLimit: config.maxSteps, signal },
    );
    return { text: finalMessageText(result.messages), messages: result.messages, threadId };
  } catch (error) {
    if (timeoutController.signal.aborted && !options.signal?.aborted) {
      throw new AgentTimeoutError(config.timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function* streamAgent(
  agent: ImpossibleAgent,
  config: Pick<AgentConfig, "maxSteps" | "timeoutMs">,
  input: string,
  options: RunOptions = {},
): AsyncGenerator<StreamChunk> {
  if (!input.trim()) throw new Error("Input must not be empty");
  const threadId = options.threadId ?? randomUUID();
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => {
    timeoutController.abort();
  }, config.timeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const events = agent.streamEvents(
      { messages: [{ role: "user", content: input }] },
      {
        version: "v2",
        configurable: { thread_id: threadId },
        recursionLimit: config.maxSteps,
        signal,
      },
    );
    for await (const event of events) {
      if (event.event !== "on_chat_model_stream") continue;
      const chunk: unknown = event.data.chunk;
      if (!(chunk instanceof AIMessageChunk)) continue;
      const text = messageText(chunk);
      if (text) yield { type: "text", text };
    }
    yield { type: "done", threadId };
  } catch (error) {
    if (timeoutController.signal.aborted && !options.signal?.aborted) {
      throw new AgentTimeoutError(config.timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
