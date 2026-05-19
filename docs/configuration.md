# Configuration

| Variable              | Default                     | Description                         |
| --------------------- | --------------------------- | ----------------------------------- |
| `MODEL_BASE_URL`      | `http://127.0.0.1:11434/v1` | OpenAI-compatible base URL          |
| `MODEL_NAME`          | `qwen3:8b`                  | Model identifier                    |
| `MODEL_API_KEY`       | `local`                     | API credential or local placeholder |
| `MODEL_TEMPERATURE`   | `0`                         | Sampling temperature                |
| `AGENT_SYSTEM_PROMPT` | local assistant prompt      | System instructions                 |
| `AGENT_MAX_STEPS`     | `12`                        | Graph recursion limit               |
| `AGENT_TIMEOUT_MS`    | `120000`                    | Per-run deadline                    |
| `AGENT_HOST`          | `127.0.0.1`                 | HTTP bind address                   |
| `AGENT_PORT`          | `4141`                      | HTTP port                           |
| `MCP_CONFIG_PATH`     | empty                       | Optional MCP server configuration   |
