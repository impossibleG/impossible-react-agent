import type { StructuredTool } from "@langchain/core/tools";
import type { Logger } from "pino";
import { buildAgent, type ImpossibleAgent } from "./agent.js";
import type { AgentConfig } from "./config.js";
import { createBuiltinTools } from "./tools.js";
import { loadMcpTools } from "./mcp.js";

export type AgentRuntime = {
  agent: ImpossibleAgent;
  tools: StructuredTool[];
  close: () => Promise<void>;
};

export async function createRuntime(config: AgentConfig, logger: Logger): Promise<AgentRuntime> {
  const tools = createBuiltinTools();
  let close = () => Promise.resolve();
  if (config.mcpConfigPath) {
    const mcp = await loadMcpTools(config.mcpConfigPath);
    tools.push(...mcp.tools);
    close = mcp.close;
    logger.info({ count: mcp.tools.length }, "loaded MCP tools");
  }
  logger.info({ tools: tools.map((tool) => tool.name) }, "agent runtime ready");
  return { agent: buildAgent(config, { tools }), tools, close };
}
