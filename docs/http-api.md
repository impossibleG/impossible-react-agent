# HTTP API

`POST /v1/chat` accepts:

```json
{
  "input": "Your request",
  "threadId": "optional-stable-conversation-id"
}
```

The response contains the final text and the thread identifier:

```json
{
  "output": "The agent response",
  "threadId": "conversation-id"
}
```

Request bodies are limited to one megabyte and prompt text is limited to 100,000 characters. Deployments exposed beyond loopback should add authentication, authorization, rate limits, and TLS at the edge.
