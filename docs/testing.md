# Testing

Unit tests cover configuration, messages, tools, request handling, deadlines, and error normalization. Agent integration tests use a deterministic fake tool-calling model, so the suite does not download a model or require an API key.

The HTTP tests use loopback ports and close every listener after the case. Run the complete local gate with:

```bash
npm run verify
```
