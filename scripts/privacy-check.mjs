import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";

const patterns = ["C:\\\\Users\\\\", "/Users/", "/home/", "BEGIN PRIVATE KEY", "api_key="];
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
for (const pattern of patterns) {
  const matches = [];
  for (const path of tracked) {
    if (path.endsWith("privacy-check.mjs")) continue;
    try {
      if ((await readFile(path, "utf8")).includes(pattern)) matches.push(path);
    } catch {
      // Binary and inaccessible files do not participate in the text scan.
    }
  }
  if (matches.length) throw new Error(`Privacy check matched ${pattern} in ${matches.join(", ")}`);
}
process.stdout.write("privacy check passed\n");
