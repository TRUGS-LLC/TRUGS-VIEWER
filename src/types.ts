// Canonical TRUG shapes + the scene_graph_state the viewer renders.
//
// The viewer renders the canonical
// graph directly — it invents NO intermediate representation between the parsed `.trug.json`
// and what is drawn. `SceneGraphState.nodes` are the raw parsed node objects passed straight
// through; `links` only RESOLVE each edge's endpoint field names (the TRUG edge schema is
// heterogeneous — from_id/to_id, from/to, source/target all coexist in the wild). Resolving a
// field name is not redefining a node/edge — no node or edge is added, dropped, or invented.

export interface TrugNode {
  id: string;
  type?: string;
  properties?: Record<string, unknown>;
  parent_id?: string | null;
  contains?: string[];
  metric_level?: string;
  dimension?: string;
  [key: string]: unknown;
}

export interface TrugEdge {
  // Heterogeneous endpoint fields — any one pair may be present.
  from_id?: string;
  to_id?: string;
  from?: string;
  to?: string;
  source?: string;
  target?: string;
  relation?: string;
  [key: string]: unknown;
}

export interface TrugEnvelope {
  name?: string;
  version?: string;
  type?: string;
  dimension?: string;
  dimensions?: Record<string, unknown>;
  nodes: TrugNode[];
  edges?: TrugEdge[];
  [key: string]: unknown;
}

// A force-graph link: endpoints resolved to ids, with the original relation + raw edge kept.
export interface SceneLink {
  source: string;
  target: string;
  relation: string;
  raw: TrugEdge;
}

export interface SceneGraphState {
  /** The parsed envelope, untouched — the canonical source of truth. */
  raw: TrugEnvelope;
  /** The raw node objects, passed through directly (each already carries `id`). */
  nodes: TrugNode[];
  /** Edges with endpoint field-names resolved; one per raw edge, none invented. */
  links: SceneLink[];
}

export type LoadResult =
  | { ok: true; state: SceneGraphState }
  | { ok: false; error: string };
