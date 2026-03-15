import type { BaseMessage } from "@langchain/core/messages";

export function messageText(message: BaseMessage): string {
  if (typeof message.content === "string") return message.content;
  return message.content
    .map((block) => {
      if (typeof block === "string") return block;
      if (block.type === "text" && "text" in block) return String(block.text);
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

export function finalMessageText(messages: BaseMessage[]): string {
  const message = messages.at(-1);
  if (!message) throw new Error("Agent returned no messages");
  return messageText(message);
}
