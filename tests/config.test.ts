import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("uses a local endpoint by default", () => {
    expect(loadConfig({})).toMatchObject({
      model: {
        baseUrl: "http://127.0.0.1:11434/v1",
        name: "qwen3:8b",
        apiKey: "local",
        temperature: 0,
      },
      maxSteps: 12,
      timeoutMs: 120_000,
      host: "127.0.0.1",
      port: 4141,
    });
  });

  it("accepts an MCP configuration path", () => {
    expect(loadConfig({ MCP_CONFIG_PATH: "./mcp.json" }).mcpConfigPath).toBe("./mcp.json");
  });

  it("rejects unsafe bounds", () => {
    expect(() => loadConfig({ AGENT_MAX_STEPS: "1" })).toThrow("Invalid configuration");
    expect(() => loadConfig({ AGENT_PORT: "99999" })).toThrow("Invalid configuration");
  });
});
