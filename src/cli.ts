#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createRuntime } from "./runtime.js";
import { runAgent } from "./runner.js";
import { startHttp } from "./http.js";
import { installShutdownHandlers } from "./lifecycle.js";
import { toError } from "./errors.js";

const program = new Command()
  .name("impossible-agent")
  .description("Run the Impossible G TypeScript ReAct agent")
  .option("-i, --input <text>", "run one prompt and exit")
  .option("--thread <id>", "conversation thread identifier")
  .option("--serve", "start the HTTP API")
  .parse();

const options = program.opts<{ input?: string; thread?: string; serve?: boolean }>();

try {
  const config = loadConfig();
  const logger = createLogger(config);
  const runtime = await createRuntime(config, logger);
  if (options.serve) {
    const http = await startHttp(config, runtime.agent, logger);
    installShutdownHandlers(async () => {
      await http.close();
      await runtime.close();
    }, logger);
  } else if (options.input) {
    const result = await runAgent(runtime.agent, config, options.input, {
      ...(options.thread ? { threadId: options.thread } : {}),
    });
    process.stdout.write(`${result.text}\n`);
    await runtime.close();
  } else {
    program.help({ error: true });
  }
} catch (cause) {
  process.stderr.write(`${toError(cause).message}\n`);
  process.exitCode = 1;
}
