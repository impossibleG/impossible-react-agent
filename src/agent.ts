import { MemorySaver } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredTool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import type { AgentConfig } from "./config.js";
import { createModel } from "./model.js";

export type AgentDependencies = {
  tools: StructuredTool[];
  model?: BaseChatModel;
};

export function buildAgent(config: AgentConfig, dependencies: AgentDependencies) {
  return createAgent({
    name: "impossible-react-agent",
    model: dependencies.model ?? createModel(config),
    tools: dependencies.tools,
    systemPrompt: config.systemPrompt,
    checkpointer: new MemorySaver(),
  });
}

export type ImpossibleAgent = ReturnType<typeof buildAgent>;
