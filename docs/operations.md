# Operations

The HTTP service binds to loopback by default. `/healthz` confirms the process can answer requests and `/readyz` confirms the runtime was assembled before the listener opened.

Logs redact common credential fields. Add application-specific secret names when extending the template. The process handles SIGINT and SIGTERM and closes both the HTTP listener and MCP client connections.

Conversation checkpoints are held in memory. Replace `MemorySaver` with a durable LangGraph checkpointer when threads must survive a process restart or multiple instances must share state.
