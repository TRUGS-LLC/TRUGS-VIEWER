import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

// The viewer ships under Apache-2.0.
describe("outbound license", () => {
  it("LICENSE is Apache-2.0", () => {
    const text = readFileSync("LICENSE", "utf8");
    expect(text).toContain("Apache License");
    expect(text).toContain("Version 2.0");
  });
});

// Attribution is present and records postprocessing as Zlib.
describe("attribution manifest", () => {
  it("THIRD_PARTY_LICENSES exists", () => {
    expect(existsSync("THIRD_PARTY_LICENSES")).toBe(true);
  });
  it("NOTICE records postprocessing as Zlib (the mislabeling trap)", () => {
    // NOTICE names the Zlib license for postprocessing; THIRD_PARTY_LICENSES
    // records each installed dependency.
    const notice = readFileSync("NOTICE", "utf8");
    expect(notice.toLowerCase()).toContain("postprocessing");
    expect(notice.toLowerCase()).toContain("zlib");
  });
});
