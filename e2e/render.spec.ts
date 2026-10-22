import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const fixture = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../test/fixtures/representative_graph.trug.json",
);

// Load the representative graph and check that a visible WebGL canvas appears.
test("loads a .trug.json and renders a 3D canvas", async ({ page }) => {
  await page.goto("/");
  await page.setInputFiles('input[type="file"]', fixture);

  // Toolbar reflects the loaded graph (600 nodes).
  await expect(page.getByText(/600 nodes/)).toBeVisible({ timeout: 15_000 });

  // A canvas is present and has non-zero dimensions (WebGL surface rendered).
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(0);
  expect(box?.height ?? 0).toBeGreaterThan(0);
});

// Malformed input shows an error instead of crashing or leaving a blank canvas.
test("malformed JSON shows an error state, not a crash", async ({ page }) => {
  await page.goto("/");
  await page.setInputFiles('input[type="file"]', {
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from('{ "nodes": [ , broken'),
  });
  await expect(page.getByRole("alert")).toContainText(/Error/i);
});
