import { readFile } from "node:fs/promises";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import type { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const serverSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  env: z.record(z.string(), z.string()).optional(),
});
const configSchema = z.object({ mcpServers: z.record(z.string(), serverSchema) });

export type McpTools = { tools: StructuredTool[]; close: () => Promise<void> };

export async function loadMcpTools(path: string): Promise<McpTools> {
  const file = await readFile(path, "utf8");
  const parsed = configSchema.parse(JSON.parse(file));
  const client = new MultiServerMCPClient({ mcpServers: parsed.mcpServers });
  const tools = await client.getTools();
  return { tools, close: () => client.close() };
}
