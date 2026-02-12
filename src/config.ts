import { z } from "zod";

const schema = z.object({
  MODEL_BASE_URL: z.url().default("http://127.0.0.1:11434/v1"),
  MODEL_NAME: z.string().min(1).default("qwen3:8b"),
  MODEL_API_KEY: z.string().min(1).default("local"),
  MODEL_TEMPERATURE: z.coerce.number().min(0).max(2).default(0),
  AGENT_SYSTEM_PROMPT: z
    .string()
    .min(1)
    .default("You are a careful local assistant. Use tools when they improve the answer."),
  AGENT_MAX_STEPS: z.coerce.number().int().min(2).max(100).default(12),
  AGENT_TIMEOUT_MS: z.coerce.number().int().min(100).max(3_600_000).default(120_000),
  AGENT_LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  AGENT_HOST: z.string().min(1).default("127.0.0.1"),
  AGENT_PORT: z.coerce.number().int().min(1).max(65_535).default(4141),
  MCP_CONFIG_PATH: z.string().optional(),
});

export type AgentConfig = {
  model: { baseUrl: string; name: string; apiKey: string; temperature: number };
  systemPrompt: string;
  maxSteps: number;
  timeoutMs: number;
  logLevel: z.infer<typeof schema>["AGENT_LOG_LEVEL"];
  host: string;
  port: number;
  mcpConfigPath?: string;
};

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AgentConfig {
  const parsed = schema.safeParse(environment);
  if (!parsed.success) throw new Error(`Invalid configuration: ${z.prettifyError(parsed.error)}`);
  const value = parsed.data;
  return {
    model: {
      baseUrl: value.MODEL_BASE_URL,
      name: value.MODEL_NAME,
      apiKey: value.MODEL_API_KEY,
      temperature: value.MODEL_TEMPERATURE,
    },
    systemPrompt: value.AGENT_SYSTEM_PROMPT,
    maxSteps: value.AGENT_MAX_STEPS,
    timeoutMs: value.AGENT_TIMEOUT_MS,
    logLevel: value.AGENT_LOG_LEVEL,
    host: value.AGENT_HOST,
    port: value.AGENT_PORT,
    ...(value.MCP_CONFIG_PATH ? { mcpConfigPath: value.MCP_CONFIG_PATH } : {}),
  };
}
