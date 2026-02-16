export class AgentTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Agent run exceeded ${String(timeoutMs)}ms`);
    this.name = "AgentTimeoutError";
  }
}

export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
