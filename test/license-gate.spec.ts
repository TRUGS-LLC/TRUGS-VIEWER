import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";

// Run the license gate against a fixture lockfile and return its exit code.
function runGate(lockfile: string): number {
  const res = spawnSync(
    "node",
    ["scripts/license-check.mjs", "--lockfile", lockfile],
    { encoding: "utf8" },
  );
  return res.status ?? 1;
}

describe("license gate", () => {
  // Copyleft dependencies must make the gate fail.
  it("FIRES (non-zero exit) on a copyleft dependency", () => {
    expect(runGate("test/fixtures/copyleft.lock")).not.toBe(0);
  });

  // A set of permissive licenses passes, including Zlib and an OR expression.
  // CI also runs the gate against the installed dependencies.
  it("PASSES (zero exit) on an all-permissive dependency set", () => {
    expect(runGate("test/fixtures/permissive.lock")).toBe(0);
  });
});
