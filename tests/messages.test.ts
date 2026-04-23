import { AIMessage } from "@langchain/core/messages";
import { describe, expect, it } from "vitest";
import { finalMessageText, messageText } from "../src/messages.js";

describe("message text", () => {
  it("reads string content", () => {
    expect(messageText(new AIMessage("hello"))).toBe("hello");
  });

  it("joins text blocks and ignores other blocks", () => {
    const message = new AIMessage({
      content: [
        { type: "text", text: "first" },
        { type: "image_url", image_url: "data:" },
      ],
    });
    expect(messageText(message)).toBe("first");
  });

  it("returns the final message", () => {
    expect(finalMessageText([new AIMessage("one"), new AIMessage("two")])).toBe("two");
    expect(() => finalMessageText([])).toThrow("no messages");
  });
});
