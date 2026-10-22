import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const fixture = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../test/fixtures/representative_graph.trug.json",
);

// Measure animation frame intervals on the representative graph.
// Framerate depends on hardware; check the 30fps goal manually on a real display.
// Automation records the measurement and checks a lower floor.
test("orbit framerate on the representative graph (advisory; records fps)", async ({ page }) => {
  await page.goto("/");
  await page.setInputFiles('input[type="file"]', fixture);
  await expect(page.getByText(/600 nodes/)).toBeVisible({ timeout: 15_000 });

  // Let the simulation reach steady state before sampling.
  await page.waitForTimeout(4000);

  const fps = await page.evaluate(
    () =>
      new Promise<number>((resolveFps) => {
        let frames = 0;
        const start = performance.now();
        function tick() {
          frames++;
          if (performance.now() - start < 2000) requestAnimationFrame(tick);
          else resolveFps((frames * 1000) / (performance.now() - start));
        }
        requestAnimationFrame(tick);
      }),
  );

  console.log(`orbit_framerate (advisory): ${fps.toFixed(1)} fps on representative_graph (600 nodes)`);
  test.info().annotations.push({ type: "fps", description: `${fps.toFixed(1)} fps` });

  // Advisory: assert only a generous floor so a genuinely broken render still fails, while the
  // 30fps judgment is made manually on real hardware.
  expect(fps).toBeGreaterThan(5);
});
