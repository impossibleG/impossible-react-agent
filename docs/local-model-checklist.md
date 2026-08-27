# Local model checklist

Before debugging the agent graph, confirm the model endpoint accepts OpenAI-compatible chat requests, the configured model exists, and tool calling works with a small schema. Verify the endpoint from the host process and from the container separately.

Start with temperature zero, a short prompt, and one built-in tool. Add MCP servers after the basic loop succeeds.
