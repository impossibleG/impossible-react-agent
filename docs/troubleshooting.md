# Troubleshooting

## The model answers but never calls a tool

Confirm the local model supports tool calling and that its OpenAI-compatible endpoint returns tool calls in the expected response field.

## The model endpoint cannot be reached from Docker

The Compose file uses `host.docker.internal`. Linux installations may need the included host-gateway mapping or a runtime on the same Compose network.

## MCP tools are missing

Validate `MCP_CONFIG_PATH`, run each configured command directly, and use absolute paths where the host process has a different working directory.
