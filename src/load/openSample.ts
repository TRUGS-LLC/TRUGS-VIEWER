import { loadTrug } from "./loadTrug";
import type { LoadResult } from "../types";

// Keep the request relative to the page so it also works under a site subdirectory.
export async function openSample(): Promise<LoadResult> {
  try {
    const response = await fetch("samples/example.trug.json");
    if (!response.ok) {
      return { ok: false, error: `Could not open sample: HTTP ${response.status}.` };
    }
    return loadTrug(await response.text());
  } catch (error) {
    return { ok: false, error: `Could not open sample: ${(error as Error).message}` };
  }
}
