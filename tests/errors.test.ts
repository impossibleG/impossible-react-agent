import { describe, expect, it } from "vitest";
import { AgentTimeoutError, toError } from "../src/errors.js";

describe("agent errors", () => {
  it("describes timeouts", () => {
    expect(new AgentTimeoutError(500)).toMatchObject({ name: "AgentTimeoutError", timeoutMs: 500 });
  });

  it("normalizes thrown values", () => {
    expect(toError("broken").message).toBe("broken");
  });
});
