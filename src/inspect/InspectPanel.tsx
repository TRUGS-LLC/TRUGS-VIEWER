import type { TrugNode } from "../types";

const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  zIndex: 2,
  width: 340,
  maxHeight: "100vh",
  overflowY: "auto",
  boxSizing: "border-box",
  padding: "14px 16px",
  background: "rgba(16,17,24,0.94)",
  borderLeft: "1px solid #2a2d3a",
  color: "#cfd2dc",
  fontFamily: "system-ui, sans-serif",
  fontSize: 13,
};

function Row({ k, v }: { k: string; v: unknown }) {
  if (v === undefined || v === null || v === "") return null;
  return (
    <div style={{ display: "flex", gap: 8, padding: "2px 0" }}>
      <span style={{ opacity: 0.55, minWidth: 92 }}>{k}</span>
      <span style={{ wordBreak: "break-word" }}>{String(v)}</span>
    </div>
  );
}

export interface InspectPanelProps {
  node: TrugNode | null;
  onClose: () => void;
}

// Read-only side panel: shows a clicked node's properties. Renders nothing when no node is
// selected. Displays the node directly from scene_graph_state, with no editing controls.
export function InspectPanel({ node, onClose }: InspectPanelProps) {
  if (!node) return null;
  return (
    <aside style={panelStyle} aria-label="node inspector">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <strong style={{ fontSize: 15, wordBreak: "break-all" }}>{node.id}</strong>
        <button
          onClick={onClose}
          aria-label="close inspector"
          style={{ background: "none", border: "none", color: "#cfd2dc", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
        >
          ×
        </button>
      </header>
      <Row k="type" v={node.type} />
      <Row k="metric_level" v={node.metric_level} />
      <Row k="dimension" v={node.dimension} />
      <Row k="parent_id" v={node.parent_id} />
      <Row k="contains" v={Array.isArray(node.contains) ? node.contains.join(", ") : undefined} />
      <h4 style={{ margin: "14px 0 6px", opacity: 0.8 }}>properties</h4>
      <pre
        style={{
          margin: 0,
          padding: 10,
          background: "#0c0d14",
          borderRadius: 6,
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {JSON.stringify(node.properties ?? {}, null, 2)}
      </pre>
    </aside>
  );
}
