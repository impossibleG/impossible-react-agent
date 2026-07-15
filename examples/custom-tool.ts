import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const add = tool(({ left, right }: { left: number; right: number }) => left + right, {
  name: "add",
  description: "Add two finite numbers.",
  schema: z.object({ left: z.number(), right: z.number() }),
});
