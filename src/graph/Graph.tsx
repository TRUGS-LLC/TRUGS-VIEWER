import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";
import R3fForceGraph, { type GraphMethods, type NodeObject } from "r3f-forcegraph";
import type { SceneGraphState } from "../types";

// Links rendered in a muted grey; nodes auto-colored by their TRUG `type`.
const LINK_COLOR = new Color("#6b7280").getStyle();

export interface GraphProps {
  state: SceneGraphState;
  /** Opens inspection when a rendered node is clicked. */
  onNodeClick?: (node: NodeObject) => void;
}

// Renders the canonical scene_graph_state directly via the R3F-native force graph.
// No intermediate representation: graphData.nodes ARE the parsed nodes; links only carry
// resolved endpoint ids. r3f-forcegraph requires its simulation be advanced once per frame
// through the ref (tickFrame) — that is layout/positioning, not a redefinition of the graph.
export function Graph({ state, onNodeClick }: GraphProps) {
  const fgRef = useRef<GraphMethods | undefined>(undefined);
  useFrame(() => {
    fgRef.current?.tickFrame();
  });

  return (
    <R3fForceGraph
      ref={fgRef}
      graphData={{ nodes: state.nodes, links: state.links }}
      nodeId="id"
      nodeAutoColorBy="type"
      nodeRelSize={4}
      nodeOpacity={0.95}
      linkColor={() => LINK_COLOR}
      linkOpacity={0.35}
      onNodeClick={onNodeClick}
    />
  );
}
