# Tools and MCP

Built-in tools live in `src/tools.ts`. Each tool has a stable name, a useful description, a Zod input schema, and a focused implementation.

MCP tools are loaded from a JSON file compatible with common desktop MCP configurations. Each server entry currently uses stdio with a command, arguments, and optional environment variables.

Tool output is untrusted data. Validate values before performing privileged actions, use absolute allowlists for filesystem or network access, and keep approval gates around destructive operations.
