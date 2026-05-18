# Architecture

The runtime is assembled from a model, built-in tools, and optional MCP tools. LangChain's agent implementation runs the ReAct cycle on LangGraph and stores thread checkpoints in memory.

```text
CLI / HTTP
    │
 runner ─ deadline / cancellation / thread
    │
 ReAct graph
    ├─ local OpenAI-compatible model
    ├─ built-in tools
    └─ MCP tools
```

Model creation, tool loading, agent assembly, and request handling live in separate modules so applications can replace any layer without rewriting the rest.
