import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
  model: "your-tool-calling-model",
  apiKey: "local",
  configuration: { baseURL: "http://127.0.0.1:8000/v1" },
});
