# Project layout

| Path            | Responsibility                           |
| --------------- | ---------------------------------------- |
| `src/model.ts`  | OpenAI-compatible local model client     |
| `src/tools.ts`  | Built-in tool definitions                |
| `src/mcp.ts`    | MCP tool discovery and connections       |
| `src/agent.ts`  | ReAct graph assembly                     |
| `src/runner.ts` | Threads, deadlines, and cancellation     |
| `src/http.ts`   | HTTP boundary and validation             |
| `tests/`        | Unit and deterministic integration tests |
