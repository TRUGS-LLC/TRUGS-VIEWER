/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Browser build with assets relative to the page, including under a site subdirectory.
// defineConfig is sourced from vitest/config so the `test` block is typed.
export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.spec.ts"],
  },
});
