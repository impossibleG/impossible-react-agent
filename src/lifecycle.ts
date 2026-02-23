import type { Logger } from "pino";

export function installShutdownHandlers(close: () => Promise<void>, logger: Logger): () => void {
  let closing = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (closing) return;
    closing = true;
    logger.info({ signal }, "shutdown requested");
    void close()
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        logger.error({ error }, "graceful shutdown failed");
        process.exit(1);
      });
  };
  const onSigint = () => {
    shutdown("SIGINT");
  };
  const onSigterm = () => {
    shutdown("SIGTERM");
  };
  process.on("SIGINT", onSigint);
  process.on("SIGTERM", onSigterm);
  return () => {
    process.off("SIGINT", onSigint);
    process.off("SIGTERM", onSigterm);
  };
}
