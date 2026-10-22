import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { openSample } from "../src/load/openSample";

it("opens the sample relative to the page under a site subdirectory", async () => {
  const text = readFileSync("public/samples/example.trug.json", "utf8");
  const sample = JSON.parse(text);
  const request = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "https://example.test/TRUGS-VIEWER/");
    expect(url.href).toBe("https://example.test/TRUGS-VIEWER/samples/example.trug.json");
    return new Response(text, { status: 200 });
  });
  vi.stubGlobal("fetch", request);
  try {
    const result = await openSample();
    expect(request).toHaveBeenCalledOnce();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.raw).toEqual(sample);
    expect(result.state.nodes.length).toBe(sample.nodes.length);
    expect(result.state.links.length).toBe(sample.edges.length);
  } finally {
    vi.unstubAllGlobals();
  }
});
