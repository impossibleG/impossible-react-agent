import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts", "src/index.ts"],
      thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 },
    },
    restoreMocks: true,
    testTimeout: 10_000,
  },
});
