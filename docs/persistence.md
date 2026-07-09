# Persistence

The template uses `MemorySaver`, so a thread survives across requests handled by one process but disappears after restart. This is suitable for development and single-process experiments.

Production deployments can provide a durable LangGraph checkpointer backed by a database. Use a stable thread identifier, isolate tenants, and define retention and deletion policies before storing conversations.
