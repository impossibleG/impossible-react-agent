# Customization checklist

- Rename the package, binary, and agent identity.
- Choose a tool-calling model available in your environment.
- Replace the example tools with the application's capabilities.
- Add approval gates around destructive or expensive tools.
- Choose a durable checkpointer when conversation state must survive restarts.
- Add authentication and rate limits before exposing the HTTP API.
- Document every environment variable and secret.
- Run `npm run verify` before the first release.
