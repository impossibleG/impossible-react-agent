import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadMcpTools } from "../src/mcp.js";

describe("loadMcpTools", () => {
  it("rejects invalid MCP configuration", async () => {
    const directory = await mkdtemp(join(tmpdir(), "impossible-agent-"));
    const path = join(directory, "mcp.json");
    await writeFile(path, JSON.stringify({ mcpServers: { bad: { args: [] } } }));
    await expect(loadMcpTools(path)).rejects.toThrow();
  });
});
