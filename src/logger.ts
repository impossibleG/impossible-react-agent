import pino, { type Logger } from "pino";
import type { AgentConfig } from "./config.js";

export function createLogger(config: Pick<AgentConfig, "logLevel">): Logger {
  return pino({
    level: config.logLevel,
    base: null,
    redact: {
      paths: [
        "apiKey",
        "*.apiKey",
        "authorization",
        "headers.authorization",
        "*.token",
        "*.secret",
      ],
      censor: "[redacted]",
    },
  });
}
