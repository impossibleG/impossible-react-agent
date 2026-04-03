import { describe, expect, it } from "vitest";
import { createLogger } from "../src/logger.js";

describe("createLogger", () => {
  it("honors the configured level", () => {
    expect(createLogger({ logLevel: "warn" }).level).toBe("warn");
  });
});
