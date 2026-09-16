import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { Logger } from "pino";
import { z } from "zod";
import type { AgentConfig } from "./config.js";
import type { ImpossibleAgent } from "./agent.js";
import { runAgent, streamAgent } from "./runner.js";
import { toError } from "./errors.js";

const requestSchema = z.object({
  input: z.string().min(1).max(100_000),
  threadId: z.string().min(1).max(200).optional(),
});

export type HttpRuntime = { server: Server; close: () => Promise<void> };

async function readJson(request: IncomingMessage, limit = 1_000_000): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
    size += buffer.length;
    if (size > limit) throw new Error("Request body is too large");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

export async function startHttp(
  config: AgentConfig,
  agent: ImpossibleAgent,
  logger: Logger,
): Promise<HttpRuntime> {
  const server = createServer((request, response) => {
    void handle(request, response);
  });

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/healthz") {
      sendJson(response, 200, { status: "ok" });
      return;
    }
    if (request.method === "GET" && url.pathname === "/readyz") {
      sendJson(response, 200, { status: "ready" });
      return;
    }
    if (request.method === "POST" && url.pathname === "/v1/chat/stream") {
      try {
        const body = requestSchema.parse(await readJson(request));
        const controller = new AbortController();
        request.once("aborted", () => {
          controller.abort();
        });
        response.writeHead(200, {
          "content-type": "text/event-stream; charset=utf-8",
          "cache-control": "no-cache",
          connection: "keep-alive",
        });
        for await (const chunk of streamAgent(agent, config, body.input, {
          ...(body.threadId ? { threadId: body.threadId } : {}),
          signal: controller.signal,
        })) {
          response.write(`event: ${chunk.type}\ndata: ${JSON.stringify(chunk)}\n\n`);
        }
        response.end();
      } catch (cause) {
        const error = toError(cause);
        logger.warn({ error }, "streaming agent request failed");
        if (!response.headersSent) {
          sendJson(response, error.name === "ZodError" ? 400 : 500, { error: error.message });
        } else {
          response.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
          response.end();
        }
      }
      return;
    }
    if (request.method !== "POST" || url.pathname !== "/v1/chat") {
      sendJson(response, 404, { error: "not_found" });
      return;
    }

    try {
      const body = requestSchema.parse(await readJson(request));
      const controller = new AbortController();
      request.once("aborted", () => {
        controller.abort();
      });
      const result = await runAgent(agent, config, body.input, {
        ...(body.threadId ? { threadId: body.threadId } : {}),
        signal: controller.signal,
      });
      sendJson(response, 200, { output: result.text, threadId: result.threadId });
    } catch (cause) {
      const error = toError(cause);
      logger.warn({ error }, "agent request failed");
      sendJson(response, error.name === "ZodError" ? 400 : 500, { error: error.message });
    }
  }

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, resolve);
  });
  logger.info({ host: config.host, port: config.port }, "agent HTTP server listening");
  return {
    server,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}

export const httpInternals = { readJson, sendJson, requestSchema };
