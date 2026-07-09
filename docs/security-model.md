# Security model

The agent can exercise the combined authority of every configured tool. Tool code must enforce identity, permissions, scope, rate limits, and confirmation requirements. A system prompt is not an authorization boundary.

Model output and tool results are untrusted. Keep destructive operations behind explicit approval, isolate secrets from prompts, and validate external URLs and filesystem paths before access.
