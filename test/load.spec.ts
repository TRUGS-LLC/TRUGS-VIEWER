import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { loadTrug, edgeEndpoints } from "../src/load";
import type { TrugEdge } from "../src/types";

const validText = readFileSync("test/fixtures/valid_small.trug.json", "utf8");
const malformedText = readFileSync("test/fixtures/malformed.json", "utf8");

// The loader preserves the parsed graph's node ids and edge endpoints.
// Compare them with an independently parsed copy of the same file.
describe("loader isomorphism (no intermediate representation)", () => {
  it("node-id set equals the parsed TRUG's exactly", () => {
    const parsed = JSON.parse(validText);
    const result = loadTrug(validText);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const expected = new Set<string>(parsed.nodes.map((n: { id: string }) => n.id));
    const actual = new Set<string>(result.state.nodes.map((n) => n.id));
    expect(actual).toEqual(expected);
    expect(result.state.nodes.length).toBe(parsed.nodes.length);
  });

  it("edge endpoint-set equals the parsed TRUG's exactly (heterogeneous fields resolved)", () => {
    const parsed = JSON.parse(validText);
    const result = loadTrug(validText);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const key = (s?: string, t?: string) => `${s}->${t}`;
    const expected = new Set<string>(
      parsed.edges.map((e: TrugEdge) => {
        const { source, target } = edgeEndpoints(e);
        return key(source, target);
      }),
    );
    const actual = new Set<string>(result.state.links.map((l) => key(l.source, l.target)));
    expect(actual).toEqual(expected);
    expect(result.state.links.length).toBe(parsed.edges.length);
  });

  it("preserves the raw envelope untouched", () => {
    const result = loadTrug(validText);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.raw.name).toBe("valid_small");
  });
});

// Malformed JSON or an unexpected shape returns an error without throwing.
describe("loader error handling (never throws)", () => {
  it("malformed JSON returns an error result, not an exception", () => {
    let result: ReturnType<typeof loadTrug> | undefined;
    expect(() => {
      result = loadTrug(malformedText);
    }).not.toThrow();
    expect(result?.ok).toBe(false);
    if (result && !result.ok) expect(result.error).toMatch(/Invalid JSON/);
  });

  it("valid JSON that is not a TRUG envelope returns an error result", () => {
    const result = loadTrug('{"hello":"world"}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/nodes/);
  });

  it("a non-object top-level value returns an error result", () => {
    const result = loadTrug("42");
    expect(result.ok).toBe(false);
  });
});
