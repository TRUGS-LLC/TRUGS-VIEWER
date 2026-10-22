import type { LoadResult, SceneLink, TrugEdge, TrugEnvelope, TrugNode } from "../types";

// Resolve an edge's endpoints across the heterogeneous TRUG edge schema (from_id/to_id,
// from/to, source/target). Returns undefined for an endpoint only if none of the variants
// is present — such an edge is malformed and reported, not silently dropped.
export function edgeEndpoints(e: TrugEdge): { source?: string; target?: string } {
  const source = (e.from_id ?? e.from ?? e.source) as string | undefined;
  const target = (e.to_id ?? e.to ?? e.target) as string | undefined;
  return { source, target };
}

// Parse `.trug.json` text into scene_graph_state. NEVER throws — malformed JSON or a
// non-conformant envelope (no `nodes` array) returns an error result so the UI can render an
// error state rather than crash.
export function loadTrug(text: string): LoadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, error: `Invalid JSON: ${(err as Error).message}` };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "Not a TRUG: top-level value is not an object." };
  }
  const env = parsed as Partial<TrugEnvelope>;
  if (!Array.isArray(env.nodes)) {
    return { ok: false, error: "Not a conformant TRUG envelope: missing `nodes` array." };
  }

  const nodes = env.nodes as TrugNode[];
  const rawEdges: TrugEdge[] = Array.isArray(env.edges) ? (env.edges as TrugEdge[]) : [];

  // Resolve every edge directly from the canonical edges — one SceneLink per raw edge,
  // none added or invented. Edges missing an endpoint are skipped from the renderable link
  // set but counted as malformed so nothing fails silently.
  const links: SceneLink[] = [];
  let malformedEdges = 0;
  for (const e of rawEdges) {
    const { source, target } = edgeEndpoints(e);
    if (source === undefined || target === undefined) {
      malformedEdges++;
      continue;
    }
    links.push({ source, target, relation: String(e.relation ?? ""), raw: e });
  }

  const state = {
    raw: { ...(env as TrugEnvelope), nodes, edges: rawEdges },
    nodes,
    links,
  };

  if (malformedEdges > 0) {
    // Non-fatal: render what is valid, but make the elision visible (never silent).
    console.warn(`loadTrug: ${malformedEdges} edge(s) had no resolvable endpoints and were skipped.`);
  }

  return { ok: true, state };
}
