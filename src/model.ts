import { ChatOpenAI } from "@langchain/openai";
import type { AgentConfig } from "./config.js";

export function createModel(config: AgentConfig): ChatOpenAI {
  return new ChatOpenAI({
    model: config.model.name,
    apiKey: config.model.apiKey,
    temperature: config.model.temperature,
    configuration: { baseURL: config.model.baseUrl },
  });
}
