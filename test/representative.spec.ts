import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { loadTrug } from "../src/load";

// Confirm the fixture has more than 500 nodes and loads without losing nodes or edges.
// Framerate is measured separately in the browser.
const text = readFileSync("test/fixtures/representative_graph.trug.json", "utf8");

describe("representative_graph fixture", () => {
  it("has > 500 nodes (DEFINE representative_graph)", () => {
    const parsed = JSON.parse(text);
    expect(parsed.nodes.length).toBeGreaterThan(500);
  });

  it("loads at scale with no dropped nodes/edges", () => {
    const parsed = JSON.parse(text);
    const result = loadTrug(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.nodes.length).toBe(parsed.nodes.length);
    expect(result.state.links.length).toBe(parsed.edges.length);
  });
});
